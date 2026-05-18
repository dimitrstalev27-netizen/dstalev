import { Router } from 'express';
import { Database } from 'sqlite';
import { randomUUID } from 'crypto';

export function getCategoriesRouter(db: Database) {
    const router = Router();

    // GET /api/categories
    router.get('/', async (req, res) => {
        try {
            const categories = await db.all(`
        SELECT c.id, c.name, COUNT(i.id) as itemCount
        FROM categories c
        LEFT JOIN inventory_items i ON c.name = i.category
        GROUP BY c.id, c.name
      `);
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Грешка при извличане на категориите' });
        }
    });

    // POST /api/categories
    router.post('/', async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Името на категорията е задължително' });
            }

            const existing = await db.get('SELECT id FROM categories WHERE name = ?', [name]);
            if (existing) {
                return res.status(400).json({ message: 'Категорията вече съществува' });
            }

            const id = randomUUID();
            await db.run('INSERT INTO categories (id, name) VALUES (?, ?)', [id, name]);

            res.status(201).json({ id, name, itemCount: 0 });
        } catch (error) {
            res.status(500).json({ message: 'Грешка при създаване на категория' });
        }
    });

    // PATCH /api/categories/:id
    router.patch('/:id', async (req, res) => {
        try {
            const { name } = req.body;
            const { id } = req.params;

            if (!name) {
                return res.status(400).json({ message: 'Името на категорията е задължително' });
            }

            const existing = await db.get('SELECT id FROM categories WHERE name = ? AND id != ?', [name, id]);
            if (existing) {
                return res.status(400).json({ message: 'Името на категорията трябва да е уникално' });
            }

            const oldCategory = await db.get('SELECT name FROM categories WHERE id = ?', [id]);
            if (!oldCategory) {
                return res.status(404).json({ message: 'Категорията не е намерена' });
            }

            await db.run('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
            await db.run('UPDATE inventory_items SET category = ? WHERE category = ?', [name, oldCategory.name]);

            res.json({ id, name });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Грешка при обновяване на категория' });
        }
    });

    // DELETE /api/categories/:id
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const category = await db.get('SELECT name FROM categories WHERE id = ?', [id]);
            if (!category) {
                return res.status(404).json({ message: 'Категорията не е намерена' });
            }

            const count = await db.get('SELECT COUNT(*) as count FROM inventory_items WHERE category = ?', [category.name]);
            if (count.count > 0) {
                return res.status(400).json({
                    message: `Категорията не може да бъде изтрита. Тя се използва от ${count.count} артикула. Първо ги преместете или изтрийте.`
                });
            }

            await db.run('DELETE FROM categories WHERE id = ?', [id]);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Грешка при изтриване на категория' });
        }
    });

    return router;
}
