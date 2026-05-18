import { useInventory } from '@/hooks/use-inventory';
import { useAuth } from '@/hooks/use-auth';
import {
    Package,
    DollarSign,
    AlertTriangle,
    XCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

export const DashboardPage = () => {
    const { user } = useAuth();
    const { stats, operations, categories, getLowStockItems, getOutOfStockItems } = useInventory();

    const lowStockItems = getLowStockItems();
    const outOfStockItems = getOutOfStockItems();
    const recentOperations = operations.slice(0, 5);

    const statCards = [
        {
            title: 'Общо артикули',
            value: stats.totalItems,
            icon: Package,
            className: 'stat-card',
            iconBg: 'bg-primary/10 text-primary',
        },
        {
            title: 'Обща стойност',
            value: `${stats.totalValue.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} лв.`,
            icon: DollarSign,
            className: 'stat-card-primary',
            iconBg: 'bg-white/20 text-white',
        },
        {
            title: 'Ниска наличност',
            value: stats.lowStockItems,
            icon: AlertTriangle,
            className: stats.lowStockItems > 0 ? 'stat-card-warning' : 'stat-card',
            iconBg: stats.lowStockItems > 0 ? 'bg-white/20 text-white' : 'bg-warning/10 text-warning',
        },
        {
            title: 'Изчерпани',
            value: stats.outOfStockItems,
            icon: XCircle,
            className: stats.outOfStockItems > 0 ? 'bg-destructive text-destructive-foreground rounded-xl p-5 shadow-md' : 'stat-card',
            iconBg: stats.outOfStockItems > 0 ? 'bg-white/20 text-white' : 'bg-destructive/10 text-destructive',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Заглавна част */}
            <div className="page-header">
                <h1 className="page-title">Добре дошли, {user?.name?.split(' ')[0]}!</h1>
                <p className="page-description">Преглед на текущото състояние на склада</p>
            </div>

            {/* Решетка със статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={stat.title} className={stat.className} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">{stat.title}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Основно съдържание */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Последни операции */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Последни операции
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOperations.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-4">
                                    Няма записани операции
                                </p>
                            ) : (
                                recentOperations.map((op) => (
                                    <div
                                        key={op.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${op.type === 'in'
                                                ? 'bg-success/15 text-success'
                                                : 'bg-destructive/15 text-destructive'
                                                }`}
                                        >
                                            {op.type === 'in' ? (
                                                <ArrowUpCircle className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownCircle className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{op.itemName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(op.createdAt), 'dd MMM, HH:mm', { locale: bg })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={op.type === 'in' ? 'operation-in' : 'operation-out'}>
                                                {op.type === 'in' ? '+' : '-'}{op.quantity}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{op.performedByName}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Сигнали */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                            Сигнали за наличност
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {outOfStockItems.length === 0 && lowStockItems.length === 0 ? (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">Всичко е наред!</p>
                                    <p className="text-xs text-muted-foreground mt-1">Няма артикули с критична наличност</p>
                                </div>
                            ) : (
                                <>
                                    {outOfStockItems.slice(0, 3).map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
                                                <XCircle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.sku}</p>
                                            </div>
                                            <Badge variant="destructive" className="badge-out-of-stock">
                                                Изчерпан
                                            </Badge>
                                        </div>
                                    ))}
                                    {lowStockItems.slice(0, 3).map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-warning/15 text-warning flex items-center justify-center">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Остават: {item.quantity} {item.unit} (мин: {item.minQuantity})
                                                </p>
                                            </div>
                                            <Badge className="badge-low-stock">Ниско</Badge>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Преглед на категориите */}
            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers className="w-5 h-5 text-primary" />
                        Категории
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {categories.map(
                            (category) => {
                                const itemCount = category.itemCount || 0;
                                return (
                                    <div
                                        key={category.id}
                                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center"
                                    >
                                        <p className="text-2xl font-bold text-primary">{itemCount}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{category.name}</p>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
