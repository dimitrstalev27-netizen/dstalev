import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { initDb } from './database';
import { getAuthRouter } from './routes/auth';
import { getInventoryRouter } from './routes/inventory';
import { getOperationsRouter } from './routes/operations';
import { getCategoriesRouter } from './routes/categories';
import { getStatsRouter } from './routes/stats';
import { getUsersRouter } from './routes/users';

const SECRET_KEY = new TextEncoder().encode(
    'stock-savvy-super-secret-key-that-is-long-enough-32-chars'
);

export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    createdAt?: string;
}

interface AuthenticatedRequest extends Request {
    user?: User;
}

export const TOKEN_NAME = 'auth_token';

export async function createToken(payload: User) {
    return await new SignJWT(payload as unknown as JWTPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<User | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as unknown as User;
    } catch (error) {
        return null;
    }
}

const app = express();
const port = 3000;

app.use(cors({
    origin: ['http://localhost:8080'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Прост middleware за автентикация чрез JWT от бисквитка
app.use(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[TOKEN_NAME];
    if (token) {
        const user = await verifyToken(token);
        if (user) {
            (req as AuthenticatedRequest).user = user;
        }
    }
    next();
});

async function startServer() {
    try {
        const db = await initDb();

        // API Маршрути
        app.use('/api/auth', getAuthRouter(db));
        app.use('/api/users', getUsersRouter(db));
        app.use('/api/inventory', getInventoryRouter(db));
        app.use('/api/operations', getOperationsRouter(db));
        app.use('/api/categories', getCategoriesRouter(db));
        app.use('/api/dashboard/stats', getStatsRouter(db));

        app.listen(port, () => {
            console.log(`Сървърът работи на http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Грешка при стартиране на сървъра:', error);
        process.exit(1);
    }
}

startServer();
