import { Router } from 'express';
import { Database } from 'sqlite';

export function getStatsRouter(db: Database) {
    const router = Router();

    // GET /api/dashboard/stats
    router.get('/', async (req, res) => {
        try {
            const totalItems = await db.get('SELECT COUNT(*) as count FROM inventory_items');
            const totalValue = await db.get('SELECT SUM(quantity * price) as value FROM inventory_items');
            const lowStockItems = await db.get('SELECT COUNT(*) as count FROM inventory_items WHERE quantity > 0 AND quantity <= minQuantity');
            const outOfStockItems = await db.get('SELECT COUNT(*) as count FROM inventory_items WHERE quantity = 0');

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentOperations = await db.get('SELECT COUNT(*) as count FROM operations WHERE createdAt >= ?', [sevenDaysAgo.toISOString()]);

            const categoriesCount = await db.get('SELECT COUNT(*) as count FROM categories');

            res.json({
                totalItems: totalItems.count,
                totalValue: totalValue.value || 0,
                lowStockItems: lowStockItems.count,
                outOfStockItems: outOfStockItems.count,
                recentOperations: recentOperations.count,
                categoriesCount: categoriesCount.count
            });
        } catch (error) {
            res.status(500).json({ message: 'Грешка при извличане на статистиката' });
        }
    });

    return router;
}
