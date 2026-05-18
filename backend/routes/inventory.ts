import { Router } from 'express';
import { Database } from 'sqlite';
import { randomUUID } from 'crypto';

export function getInventoryRouter(db: Database) {
    const router = Router();

    // GET /api/inventory
    router.get('/', async (req, res) => {
        try {
            const items = await db.all('SELECT * FROM inventory_items ORDER BY createdAt DESC');
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Грешка при извличане на инвентара' });
        }
    });

    // GET /api/inventory/:id
    router.get('/:id', async (req, res) => {
        try {
            const item = await db.get('SELECT * FROM inventory_items WHERE id = ?', [req.params.id]);
            if (item) {
                res.json(item);
            } else {
                res.status(404).json({ message: 'Артикулът не е намерен' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Грешка при извличане на артикула' });
        }
    });

    // POST /api/inventory
    router.post('/', async (req, res) => {
        try {
            const { sku, name, category, quantity, minQuantity, unit, price, location, description } = req.body;
            const id = randomUUID();
            const now = new Date().toISOString();

            await db.run(
                `INSERT INTO inventory_items (id, sku, name, category, quantity, minQuantity, unit, price, location, description, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, sku, name, category, quantity || 0, minQuantity || 0, unit, price || 0, location, description, now, now]
            );

            const newItem = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ message: 'Грешка при създаване на артикул' });
        }
    });

    // POST /api/inventory/bulk
    router.post('/bulk', async (req, res) => {
        try {
            const items = req.body;
            if (!Array.isArray(items)) {
                return res.status(400).json({ message: 'Очаква се масив от артикули' });
            }

            const now = new Date().toISOString();
            const stmt = await db.prepare(
                `INSERT INTO inventory_items (id, sku, name, category, quantity, minQuantity, unit, price, location, description, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );

            for (const item of items) {
                const id = randomUUID();
                await stmt.run([
                    id,
                    item.sku,
                    item.name,
                    item.category,
                    item.quantity || 0,
                    item.minQuantity || 0,
                    item.unit || 'бр.',
                    item.price || 0,
                    item.location || '',
                    item.description || '',
                    now,
                    now
                ]);
            }

            await stmt.finalize();
            res.status(201).json({ message: `Успешно импортирани ${items.length} артикула` });
        } catch (error) {
            console.error('Bulk import error:', error);
            res.status(500).json({ message: 'Грешка при масово импортиране' });
        }
    });

    // PATCH /api/inventory/:id
    router.patch('/:id', async (req, res) => {
        try {
            const fields = req.body;
            const id = req.params.id;

            const setClause = Object.keys(fields)
                .map(key => `${key} = ?`)
                .join(', ');

            const values = Object.values(fields);
            values.push(new Date().toISOString()); // updatedAt
            values.push(id);

            await db.run(
                `UPDATE inventory_items SET ${setClause}, updatedAt = ? WHERE id = ?`,
                values
            );

            const updatedItem = await db.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
            if (updatedItem) {
                res.json(updatedItem);
            } else {
                res.status(404).json({ message: 'Артикулът не е намерен' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Грешка при обновяване на артикула' });
        }
    });

    // DELETE /api/inventory/:id
    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const result = await db.run('DELETE FROM inventory_items WHERE id = ?', [id]);
            if (result.changes && result.changes > 0) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Артикулът не е намерен' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Грешка при изтриване на артикула' });
        }
    });

    // DELETE /api/inventory/bulk/delete
    router.post('/bulk/delete', async (req, res) => {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids)) {
                return res.status(400).json({ message: 'Очаква се масив от ID-та' });
            }

            const placeholders = ids.map(() => '?').join(',');
            await db.run(`DELETE FROM inventory_items WHERE id IN (${placeholders})`, ids);

            res.status(200).json({ message: `Успешно изтрити ${ids.length} артикула` });
        } catch (error) {
            console.error('Bulk delete error:', error);
            res.status(500).json({ message: 'Грешка при масово изтриване' });
        }
    });

    return router;
}
