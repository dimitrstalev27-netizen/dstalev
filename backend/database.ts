import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

export async function initDb(): Promise<Database> {
    const dataDir = path.resolve(process.cwd(), 'backend', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'database.sqlite');
    const schemaPath = path.resolve(process.cwd(), 'backend', 'schema.sql');
    const seedPath = path.resolve(process.cwd(), 'backend', 'seed.sql');

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Изпълнение на схемата
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);

    // Начално зареждане на данни, ако базата е празна
    const itemCount = await db.get('SELECT COUNT(*) as count FROM inventory_items');
    if (itemCount.count === 0) {
        console.log('Зареждане на начални данни в базата от seed.sql...');
        const seed = fs.readFileSync(seedPath, 'utf8');
        await db.exec(seed);
        console.log('Началните данни са заредени успешно.');
    }

    return db;
}

