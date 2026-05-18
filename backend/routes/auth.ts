import { Router, Request } from 'express';
import { Database } from 'sqlite';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { createToken, TOKEN_NAME, User } from '../server';

// Интерфейс за нашия разширен Request
interface AuthRequest extends Request {
    user?: User;
}

export function getAuthRouter(db: Database) {
    const router = Router();

    // Вход: POST /api/auth/login
    router.post('/login', async (req, res) => {
        try {
            const { email: bodyEmail, username: bodyUsername, password } = req.body;
            const email = bodyEmail || bodyUsername;

            if (!email || !password) {
                return res.status(400).json({ message: 'Имейлът и паролата са задължителни' });
            }

            const user = await db.get(
                'SELECT id, username, email, name, role, password FROM users WHERE email = ?',
                [email]
            );

            if (!user) {
                return res.status(401).json({ message: 'Невалиден имейл или парола' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Невалиден имейл или парола' });
            }

            const { password: _, ...userWithoutPassword } = user;
            
            // Генерираме JWT токен
            const token = await createToken(userWithoutPassword);
            
            // Записваме токена в бисквитка
            res.cookie(TOKEN_NAME, token, {
                httpOnly: true,
                secure: false, // true при HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 24 часа
            });
            
            res.json({ user: userWithoutPassword });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Грешка при вход' });
        }
    });

    // Регистрация: POST /api/auth/register
    router.post('/register', async (req, res) => {
        try {
            const { username, email, password, name, role = 'user' } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ message: 'Потребителското име, имейлът и паролата са задължителни' });
            }

            // Ако името липсва, ползваме потребителското име
            const displayName = name || username;

            // Валидации...
            if (username.length < 3) return res.status(400).json({ message: 'Потребителското име трябва да е поне 3 символа' });
            if (password.length < 6) return res.status(400).json({ message: 'Паролата трябва да е поне 6 символа' });
            if (!email.includes('@')) return res.status(400).json({ message: 'Невалиден имейл адрес' });

            const existingUsername = await db.get('SELECT id FROM users WHERE username = ?', [username]);
            if (existingUsername) return res.status(400).json({ message: 'Потребителското име вече съществува' });

            const id = randomUUID();
            const createdAt = new Date().toISOString();
            const hashedPassword = await bcrypt.hash(password, 10);

            await db.run(
                'INSERT INTO users (id, username, email, password, name, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, username, email, hashedPassword, displayName, role, createdAt]
            );

            const newUser = { id, username, email, name: displayName, role };
            
            // Генерираме токен за автоматичен вход
            const token = await createToken(newUser);
            res.cookie(TOKEN_NAME, token, {
                httpOnly: true,
                secure: false,
                maxAge: 24 * 60 * 60 * 1000
            });
            
            res.status(201).json({ user: newUser });
        } catch (error) {
            res.status(500).json({ message: 'Грешка при регистрация' });
        }
    });

    // Излизане: POST /api/auth/logout
    router.post('/logout', (req, res) => {
        res.clearCookie(TOKEN_NAME);
        res.json({ message: 'Успешно излизане' });
    });

    // Текущ потребител: GET /api/auth/me
    router.get('/me', (req: AuthRequest, res) => {
        if (req.user) {
            res.json({ user: req.user });
        } else {
            res.status(401).json({ message: 'Няма активна сесия' });
        }
    });

    return router;
}
