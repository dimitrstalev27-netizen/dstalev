import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, UserRole } from '@/types/inventory';
import { useCallback } from 'react';

export function useAuth() {
    const queryClient = useQueryClient();

    // Състояние: Вземане на текущия потребител от сървъра (сесията)
    const { data: userData, isLoading } = useQuery<{ user: User } | null>({
        queryKey: ['authUser'],
        queryFn: () => api.auth.me(),
        staleTime: 5 * 60 * 1000, // 5 минути
        retry: false,
    });

    const user = userData?.user ?? null;

    // Действия: Мутации за вход и регистрация
    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) => api.auth.login(email, password),
        onSuccess: (data) => {
            if (data.user) {
                queryClient.setQueryData(['authUser'], { user: data.user });
            }
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: { username: string; email: string; password: string; name: string; role?: string }) => api.auth.register(data),
        onSuccess: (data) => {
            if (data.user) {
                queryClient.setQueryData(['authUser'], { user: data.user });
            }
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => api.auth.logout(),
        onSuccess: () => {
            queryClient.setQueryData(['authUser'], null);
            queryClient.clear();
        },
    });

    const logout = useCallback(async () => {
        await logoutMutation.mutateAsync();
    }, [logoutMutation]);

    const login = async (email: string, password: string) => {
        try {
            const res = await loginMutation.mutateAsync({ email, password });
            return { success: !!res.user };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    };

    const register = async (username: string, email: string, password: string, name?: string, role: UserRole = 'user') => {
        try {
            const res = await registerMutation.mutateAsync({ username, email, password, name, role });
            return { success: !!res.user };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    };

    return {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        updateProfile: (updatedUser: User) => {
            queryClient.setQueryData(['authUser'], { user: updatedUser });
        }
    };
}
