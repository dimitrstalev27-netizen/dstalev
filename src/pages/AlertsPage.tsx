import { useInventory } from '@/hooks/use-inventory';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    XCircle,
    Package,
    ArrowRight,
    CheckCircle,
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AlertsPage = () => {
    const { getLowStockItems, getOutOfStockItems } = useInventory();

    const lowStockItems = getLowStockItems();
    const outOfStockItems = getOutOfStockItems();

    const hasAlerts = lowStockItems.length > 0 || outOfStockItems.length > 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Заглавна част */}
            <div className="page-header">
                <h1 className="page-title">Сигнали за наличност</h1>
                <p className="page-description">
                    Артикули с критично ниско или изчерпано количество
                </p>
            </div>

            {/* Обобщаващи карти */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={outOfStockItems.length > 0 ? 'border-destructive/50' : ''}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${outOfStockItems.length > 0
                                    ? 'bg-destructive/15 text-destructive'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Изчерпани</p>
                                <p className="text-2xl font-bold">{outOfStockItems.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={lowStockItems.length > 0 ? 'border-warning/50' : ''}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockItems.length > 0
                                    ? 'bg-warning/15 text-warning'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ниска наличност</p>
                                <p className="text-2xl font-bold">{lowStockItems.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Общо сигнали</p>
                                <p className="text-2xl font-bold">
                                    {outOfStockItems.length + lowStockItems.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!hasAlerts ? (
                /* Състояние без сигнали */
                <Card className="shadow-card">
                    <CardContent className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Всичко е наред!</h3>
                            <p className="text-muted-foreground max-w-md">
                                Няма артикули с критична наличност. Всички артикули са над минималното
                                зададено количество.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Изчерпани артикули */}
                    {outOfStockItems.length > 0 && (
                        <Card className="shadow-card border-destructive/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                    <XCircle className="w-5 h-5" />
                                    Изчерпани артикули
                                </CardTitle>
                                <CardDescription>
                                    Артикули с нулево количество, които изискват спешно зареждане
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {outOfStockItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{item.name}</p>
                                                    <Badge variant="destructive">Изчерпан</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {item.sku} • Минимум: {item.minQuantity} {item.unit} •{' '}
                                                    {item.location}
                                                </p>
                                            </div>
                                            <Link to="/operations">
                                                <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                                                    Зареди
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Артикули с ниска наличност */}
                    {lowStockItems.length > 0 && (
                        <Card className="shadow-card border-warning/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-warning">
                                    <AlertTriangle className="w-5 h-5" />
                                    Ниска наличност
                                </CardTitle>
                                <CardDescription>
                                    Артикули под минималното зададено количество
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {lowStockItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 rounded-lg bg-warning/5 border border-warning/20"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-warning/15 text-warning flex items-center justify-center">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{item.name}</p>
                                                    <Badge className="badge-low-stock">
                                                        {item.quantity} / {item.minQuantity} {item.unit}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {item.sku} • {item.category} • {item.location}
                                                </p>
                                            </div>
                                            <Link to="/operations">
                                                <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning/10">
                                                    Зареди
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};
