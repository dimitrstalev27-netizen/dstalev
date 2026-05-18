import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Shield, UserCircle } from 'lucide-react';

export const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        username: user?.username || '',
    });

    // Обновяване на данните при промяна на потребителя (напр. начално зареждане)
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                username: user.username || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user?.id) throw new Error('Потребителят не е намерен');

            // Обновяване на потребителя чрез API заявка към /users/:id с PATCH роля/данни.

            const updatedUser = await api.users.update(user.id, {
                ...user,
                name: formData.name,
                email: formData.email
            });

            updateProfile(updatedUser);

            toast({
                title: "Успех",
                description: "Профилът е обновен успешно.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Грешка",
                description: "Възникна грешка при обновяване на профила.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Моят профил</h1>

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                {/* Обобщена информация за профила */}
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                                    {getInitials(formData.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle>{formData.name}</CardTitle>
                        <CardDescription>{formData.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <UserCircle className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Роля</p>
                                    <p className="text-sm font-semibold capitalize">{user?.role === 'admin' ? 'Администратор' : 'Потребител'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Shield className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Статус</p>
                                    <p className="text-sm font-semibold text-green-600">Активен</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Форма за редактиране на профил */}
                <Card>
                    <CardHeader>
                        <CardTitle>Редактиране на профил</CardTitle>
                        <CardDescription>
                            Актуализирайте личната си информация
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Потребителско име</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        disabled
                                        className="pl-9 bg-muted"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Потребителското име е уникално и не може да се променя.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Имейл адрес</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6 bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Последна промяна: {new Date().toLocaleDateString('bg-BG')}
                        </p>
                        <Button type="submit" form="profile-form" disabled={loading}>
                            {loading ? 'Запазване...' : 'Запази промените'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
