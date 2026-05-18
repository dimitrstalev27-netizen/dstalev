import { User, InventoryItem, StockOperation, Category, DashboardStats } from '@/types/inventory';

const API_URL = 'http://localhost:3000/api';

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Грешка при вход');
            }
            return res.json();
        },
        register: async (data: { username: string; email: string; password: string; name: string; role?: string }) => {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Грешка при регистрация');
            }
            return res.json();
        },
        logout: async () => {
            const res = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при излизане');
            return res.json();
        },
        me: async () => {
            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
            });
            if (!res.ok) return null;
            return res.json();
        },
    },
    users: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/users`, { credentials: 'include' });
            if (!res.ok) throw new Error('Грешка при извличане на потребителите');
            return res.json();
        },
        update: async (id: string, data: Partial<User>) => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при обновяване на потребителя');
            return res.json();
        },
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при изтриване на потребителя');
            return true;
        },
    },
    inventory: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/inventory`, { credentials: 'include' });
            if (!res.ok) throw new Error('Грешка при извличане на инвентара');
            return res.json();
        },
        getById: async (id: string) => {
            const res = await fetch(`${API_URL}/inventory/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Грешка при извличане на артикула');
            return res.json();
        },
        create: async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
            const res = await fetch(`${API_URL}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при създаване на артикул');
            return res.json();
        },
        bulkCreate: async (items: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[]) => {
            const res = await fetch(`${API_URL}/inventory/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при масово създаване на артикули');
            return res.json();
        },
        update: async (id: string, data: Partial<InventoryItem>) => {
            const res = await fetch(`${API_URL}/inventory/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при обновяване на артикула');
            return res.json();
        },
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/inventory/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при изтриване на артикула');
            return true;
        },
        bulkDelete: async (ids: string[]) => {
            const res = await fetch(`${API_URL}/inventory/bulk/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при масово изтриване на артикули');
            return res.json();
        },
    },
    operations: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/operations`, { credentials: 'include' });
            if (!res.ok) throw new Error('Грешка при извличане на операциите');
            return res.json();
        },
        create: async (data: Omit<StockOperation, 'id' | 'createdAt'>) => {
            const res = await fetch(`${API_URL}/operations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Грешка при запис на операцията');
            return res.json();
        },
    },
    categories: {
        getAll: async () => {
            const res = await fetch(`${API_URL}/categories`, { credentials: 'include' });
            if (!res.ok) throw new Error('Грешка при извличане на категориите');
            return res.json();
        },
        create: async (name: string) => {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Грешка при създаване на категория');
            }
            return res.json();
        },
        update: async (id: string, name: string) => {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Грешка при обновяване на категория');
            }
            return res.json();
        },
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Грешка при изтриване на категория');
            }
            return true;
        },
    },
    dashboard: {
        getStats: async () => {
            const res = await fetch(`${API_URL}/dashboard/stats`, { credentials: 'include' });
            if (!res.ok) throw new Error('Грешка при извличане на статистиката');
            return res.json();
        },
    },
};
