import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { User } from '@/types/inventory';
import {
    Search,
    Users,
    Shield,
    Trash2,
    UserCog,
    UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const UsersPage = () => {
    const { user: authUser, isAdmin } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Състояния на диалозите
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Диалог за създаване на потребител
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createData, setCreateData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        role: 'user'
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.users.getAll();
            setUsers(data);
        } catch (error) {
            toast({
                title: 'Грешка',
                description: 'Неуспешно зареждане на потребителите.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [isAdmin, navigate, fetchUsers]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (id === authUser?.id) {
            toast({
                title: 'Грешка',
                description: 'Не можете да изтриете собствения си акаунт.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await api.users.delete(id);
            setUsers(users.filter(u => u.id !== id));
            setDeleteConfirmId(null);
            toast({
                title: 'Изтрито',
                description: 'Потребителят беше изтрит успешно.',
                variant: 'destructive',
            });
        } catch (error) {
            toast({
                title: 'Грешка',
                description: 'Възникна проблем при изтриване на потребителя.',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;

        try {
            const updated = await api.users.update(editUser.id, { role: editUser.role });
            setUsers(users.map(u => u.id === updated.id ? updated : u));
            setIsEditDialogOpen(false);
            setEditUser(null);
            toast({
                title: 'Успешно',
                description: 'Ролята на потребителя беше обновена.',
            });
        } catch (error) {
            toast({
                title: 'Грешка',
                description: 'Възникна проблем при обновяване.',
                variant: 'destructive',
            });
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.auth.register(createData); // Регистрация на нов потребител
            setIsCreateDialogOpen(false);
            setCreateData({
                username: '',
                email: '',
                password: '',
                name: '',
                role: 'user'
            });
            fetchUsers(); // Обновяване на списъка
            toast({
                title: 'Успешно',
                description: 'Новият потребител беше създаден.',
            });
        } catch (error) {
            toast({
                title: 'Грешка',
                description: 'Неуспешно създаване на потребител.',
                variant: 'destructive',
            });
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Заглавна част */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="page-header">
                    <h1 className="page-title">Управление на потребители</h1>
                    <p className="page-description">Администриране на достъпа до системата</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Нов потребител
                </Button>
            </div>

            {/* Търсене */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Търсене по име, потребителско име или имейл..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-search max-w-md"
                />
            </div>

            {/* Таблица */}
            <div className="table-container">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead>Потребител</TableHead>
                            <TableHead>Имейл</TableHead>
                            <TableHead>Роля</TableHead>
                            <TableHead>Дата на регистрация</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Users className="w-10 h-10 mb-2 opacity-50" />
                                        <p>Няма намерени потребители</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((u) => (
                                <TableRow key={u.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {u.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium">{u.name}</div>
                                                <div className="text-xs text-muted-foreground">@{u.username}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                                            {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                                            {u.role === 'admin' ? 'Администратор' : 'Потребител'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {u.createdAt ? format(new Date(u.createdAt), 'dd.MM.yyyy', { locale: bg }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditUser(u);
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                <UserCog className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteConfirmId(u.id)}
                                                disabled={u.id === authUser?.id}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Диалог за редактиране на роля */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Редактиране на роля</DialogTitle>
                        <DialogDescription>Промяна на правата за достъп на {editUser?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateRole}>
                        <div className="py-4">
                            <Label>Роля</Label>
                            <Select
                                value={editUser?.role}
                                onValueChange={(val: User['role']) => setEditUser(prev => prev ? { ...prev, role: val } : null)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Потребител</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отказ</Button>
                            <Button type="submit">Запази</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Диалог за нов потребител */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Нов потребител</DialogTitle>
                        <DialogDescription>Създаване на нов акаунт в системата</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Потребителско име</Label>
                            <Input
                                value={createData.username}
                                onChange={e => setCreateData({ ...createData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Име</Label>
                            <Input
                                value={createData.name}
                                onChange={e => setCreateData({ ...createData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Имейл</Label>
                            <Input
                                type="email"
                                value={createData.email}
                                onChange={e => setCreateData({ ...createData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Парола</Label>
                            <Input
                                type="password"
                                value={createData.password}
                                onChange={e => setCreateData({ ...createData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Роля</Label>
                            <Select
                                value={createData.role}
                                onValueChange={(val) => setCreateData({ ...createData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Потребител</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Отказ</Button>
                            <Button type="submit">Създай</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Потвърждение за изтриване */}
            <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Потвърждение за изтриване</DialogTitle>
                        <DialogDescription>
                            Сигурни ли сте, че искате да изтриете този потребител? Действието е необратимо.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                            Отказ
                        </Button>
                        <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
                            Изтрий
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
