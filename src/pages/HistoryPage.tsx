import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Search,
    Calendar,
    Filter,
    User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export const HistoryPage = () => {
    const { operations } = useInventory();

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const filteredOperations = useMemo(() => {
        return operations.filter((op) => {
            const matchesSearch =
                op.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                op.itemSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                op.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                op.performedByName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === 'all' || op.type === typeFilter;

            let matchesDate = true;
            if (dateFilter !== 'all') {
                const opDate = new Date(op.createdAt);
                const now = new Date();

                if (dateFilter === 'today') {
                    matchesDate = opDate.toDateString() === now.toDateString();
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    matchesDate = opDate >= weekAgo;
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    matchesDate = opDate >= monthAgo;
                }
            }

            return matchesSearch && matchesType && matchesDate;
        });
    }, [operations, searchQuery, typeFilter, dateFilter]);

    const sortedOperations = [...filteredOperations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Заглавна част */}
            <div className="page-header">
                <h1 className="page-title">История на операциите</h1>
                <p className="page-description">
                    Преглед на всички извършени складови операции
                </p>
            </div>

            {/* Филтри */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Търсене по артикул, причина или служител..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-search"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Тип операция" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Всички типове</SelectItem>
                        <SelectItem value="in">Приемане</SelectItem>
                        <SelectItem value="out">Изписване</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Период" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        <SelectItem value="today">Днес</SelectItem>
                        <SelectItem value="week">Последна седмица</SelectItem>
                        <SelectItem value="month">Последен месец</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Обобщение */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{filteredOperations.length}</p>
                            <p className="text-sm text-muted-foreground">Общо операции</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                            <ArrowUpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {filteredOperations.filter((op) => op.type === 'in').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Приемания</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                            <ArrowDownCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {filteredOperations.filter((op) => op.type === 'out').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Изписвания</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Таблица */}
            <div className="table-container">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="w-16">Тип</TableHead>
                            <TableHead>Артикул</TableHead>
                            <TableHead className="text-right">Количество</TableHead>
                            <TableHead className="text-right">Преди</TableHead>
                            <TableHead className="text-right">След</TableHead>
                            <TableHead>Причина</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    Служител
                                </div>
                            </TableHead>
                            <TableHead>Дата</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedOperations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Calendar className="w-10 h-10 mb-2 opacity-50" />
                                        <p>Няма намерени операции</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedOperations.map((op) => (
                                <TableRow key={op.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        <div
                                            className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center',
                                                op.type === 'in'
                                                    ? 'bg-success/15 text-success'
                                                    : 'bg-destructive/15 text-destructive'
                                            )}
                                        >
                                            {op.type === 'in' ? (
                                                <ArrowUpCircle className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownCircle className="w-4 h-4" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{op.itemName}</p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {op.itemSku}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            variant="outline"
                                            className={op.type === 'in' ? 'badge-in-stock' : 'badge-out-of-stock'}
                                        >
                                            {op.type === 'in' ? '+' : '-'}{op.quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {op.previousQuantity}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {op.newQuantity}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                        {op.reason}
                                    </TableCell>
                                    <TableCell className="text-sm">{op.performedByName}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(op.createdAt), 'dd.MM.yyyy HH:mm', { locale: bg })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
