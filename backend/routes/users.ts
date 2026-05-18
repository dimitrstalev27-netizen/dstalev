import { Router } from 'express';
import { Database } from 'sqlite';

export function getUsersRouter(db: Database) {
    const router = Router();

    // GET /api/users
    router.get('/', async (req, res) => {
        try {
            const users = await db.all('SELECT id, username, email, name, role, createdAt FROM users');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Грешка при извличане на потребителите' });
        }
    });

    // PATCH /api/users/:id
    router.patch('/:id', async (req, res) => {
        try {
            const { role, name, email } = req.body;
            const id = req.params.id;

            await db.run(
                'UPDATE users SET role = COALESCE(?, role), name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
                [role, name, email, id]
            );

            const updatedUser = await db.get('SELECT id, username, email, name, role, createdAt FROM users WHERE id = ?', [id]);
            if (updatedUser) {
                res.json(updatedUser);
            } else {
                res.status(404).json({ message: 'Потребителят не е намерен' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Грешка при обновяване на потребителя' });
        }
    });

    // DELETE /api/users/:id
    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
            if (result.changes && result.changes > 0) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Потребителят не е намерен' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Грешка при изтриване на потребителя' });
        }
    });

    return router;
}
