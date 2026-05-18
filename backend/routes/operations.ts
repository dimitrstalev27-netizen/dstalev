import { Router } from 'express';
import { Database } from 'sqlite';
import { randomUUID } from 'crypto';

export function getOperationsRouter(db: Database) {
    const router = Router();

    // GET /api/operations
    router.get('/', async (req, res) => {
        try {
            const operations = await db.all('SELECT * FROM operations ORDER BY createdAt DESC');
            res.json(operations);
        } catch (error) {
            res.status(500).json({ message: 'Грешка при извличане на операциите' });
        }
    });

    // POST /api/operations
    router.post('/', async (req, res) => {
        try {
            const { itemId, type, quantity, reason, performedBy, performedByName } = req.body;

            const item = await db.get('SELECT * FROM inventory_items WHERE id = ?', [itemId]);
            if (!item) {
                return res.status(404).json({ message: 'Артикулът не е намерен' });
            }

            const previousQuantity = item.quantity;
            const newQuantity = type === 'in' ? previousQuantity + quantity : previousQuantity - quantity;

            if (newQuantity < 0) {
                return res.status(400).json({ message: 'Недостатъчна наличност' });
            }

            const operationId = randomUUID();
            const now = new Date().toISOString();

            await db.run(
                `INSERT INTO operations (id, itemId, itemName, itemSku, type, quantity, previousQuantity, newQuantity, reason, performedBy, performedByName, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [operationId, itemId, item.name, item.sku, type, quantity, previousQuantity, newQuantity, reason, performedBy, performedByName, now]
            );

            await db.run(
                'UPDATE inventory_items SET quantity = ?, updatedAt = ? WHERE id = ?',
                [newQuantity, now, itemId]
            );

            const operation = await db.get('SELECT * FROM operations WHERE id = ?', [operationId]);
            res.status(201).json(operation);
        } catch (error) {
            res.status(500).json({ message: 'Грешка при запис на операцията' });
        }
    });

    return router;
}
