import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { InventoryItem, StockOperation, Category } from '@/types/inventory';
import { useAuth } from '@/hooks/use-auth';
import { useCallback, useMemo } from 'react';

export function useInventory() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // --- Заявки ---
    const itemsQuery = useQuery({
        queryKey: ['inventory'],
        queryFn: api.inventory.getAll,
    });

    const operationsQuery = useQuery({
        queryKey: ['operations'],
        queryFn: api.operations.getAll,
    });

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: api.categories.getAll,
    });

    const statsQuery = useQuery({
        queryKey: ['stats'],
        queryFn: api.dashboard.getStats,
    });

    // --- Мутации ---
    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['operations'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
    };

    const addItem = useMutation({
        mutationFn: api.inventory.create,
        onSuccess: invalidateAll,
    });

    const bulkAddItem = useMutation({
        mutationFn: api.inventory.bulkCreate,
        onSuccess: invalidateAll,
    });

    const updateItem = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => api.inventory.update(id, data),
        onSuccess: invalidateAll,
    });

    const deleteItem = useMutation({
        mutationFn: api.inventory.delete,
        onSuccess: invalidateAll,
    });

    const bulkDeleteItems = useMutation({
        mutationFn: api.inventory.bulkDelete,
        onSuccess: invalidateAll,
    });

    const addOperation = useMutation({
        mutationFn: (data: Omit<StockOperation, 'id' | 'createdAt' | 'performedBy' | 'performedByName'>) =>
            api.operations.create({
                ...data,
                performedBy: user?.id || '',
                performedByName: user?.name || 'Неизвестен',
            }),
        onSuccess: invalidateAll,
    });

    const addCategory = useMutation({
        mutationFn: api.categories.create,
        onSuccess: invalidateAll,
    });

    const updateCategory = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => api.categories.update(id, name),
        onSuccess: invalidateAll,
    });

    const deleteCategory = useMutation({
        mutationFn: api.categories.delete,
        onSuccess: invalidateAll,
    });

    // --- Помощни функции ---
    const items = useMemo(() => itemsQuery.data || [], [itemsQuery.data]);

    const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

    const getLowStockItems = useCallback(
        () => items.filter((item) => item.quantity > 0 && item.quantity <= item.minQuantity),
        [items]
    );

    const getOutOfStockItems = useCallback(
        () => items.filter((item) => item.quantity === 0),
        [items]
    );

    return {
        items,
        operations: operationsQuery.data || [],
        categories: categoriesQuery.data || [],
        stats: statsQuery.data || {
            totalItems: 0,
            totalValue: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            recentOperations: 0,
            categoriesCount: 0,
        },
        loading: itemsQuery.isLoading || operationsQuery.isLoading || categoriesQuery.isLoading || statsQuery.isLoading,

        // Мутации (обвити за съвместимост със старата версия)
        addItem: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => addItem.mutateAsync(data),
        bulkAddItem: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[]) => bulkAddItem.mutateAsync(data),
        updateItem: (id: string, data: Partial<InventoryItem>) => updateItem.mutateAsync({ id, data }),
        deleteItem: (id: string) => deleteItem.mutateAsync(id),
        bulkDeleteItems: (ids: string[]) => bulkDeleteItems.mutateAsync(ids),
        addOperation: (data: Omit<StockOperation, 'id' | 'createdAt' | 'performedBy' | 'performedByName'>) => addOperation.mutateAsync(data),
        addCategory: (name: string) => addCategory.mutateAsync(name),
        updateCategory: (id: string, name: string) => updateCategory.mutateAsync({ id, name }),
        deleteCategory: (id: string) => deleteCategory.mutateAsync(id),

        // Помощни методи
        getItemById,
        getLowStockItems,
        getOutOfStockItems,
        refreshData: async () => { invalidateAll(); },
    };
}
