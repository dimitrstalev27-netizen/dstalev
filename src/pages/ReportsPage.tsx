import { useMemo } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import {
  FileBarChart,
  Package,
  TrendingUp,
  TrendingDown,
  Layers,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export const ReportsPage = () => {
  const { items, operations, categories } = useInventory();

  const categoryStats = useMemo(() => {
    const stats = categories.map((cat) => {
      const categoryItems = items.filter((item) => item.category === cat.name);
      const totalValue = categoryItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const totalQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        name: cat.name,
        itemCount: categoryItems.length,
        totalQuantity,
        totalValue,
      };
    });
    return stats.sort((a, b) => b.totalValue - a.totalValue);
  }, [items, categories]);

  const operationStats = useMemo(() => {
    const inOps = operations.filter((op) => op.type === 'in');
    const outOps = operations.filter((op) => op.type === 'out');

    const totalIn = inOps.reduce((sum, op) => sum + op.quantity, 0);
    const totalOut = outOps.reduce((sum, op) => sum + op.quantity, 0);

    return {
      inCount: inOps.length,
      outCount: outOps.length,
      totalIn,
      totalOut,
    };
  }, [operations]);

  const topItems = useMemo(() => {
    return [...items]
      .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
      .slice(0, 10);
  }, [items]);

  const totalInventoryValue = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const maxCategoryValue = Math.max(...categoryStats.map((c) => c.totalValue));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Заглавна част */}
      <div className="page-header">
        <h1 className="page-title">Справки и отчети</h1>
        <p className="page-description">Анализ на складовата наличност и движение</p>
      </div>

      {/* Обобщаващи карти */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Обща стойност</p>
                <p className="text-xl font-bold">
                  {totalInventoryValue.toLocaleString('bg-BG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  лв.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Приети общо</p>
                <p className="text-xl font-bold">
                  {operationStats.totalIn} бр.
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({operationStats.inCount} оп.)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Изписани общо</p>
                <p className="text-xl font-bold">
                  {operationStats.totalOut} бр.
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({operationStats.outCount} оп.)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Артикули</p>
                <p className="text-xl font-bold">
                  {items.length}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    в {categories.length} категории
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Разпределение по категории */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Разпределение по категории
            </CardTitle>
            <CardDescription>Стойност на наличностите по категория</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-muted-foreground">
                      {cat.totalValue.toLocaleString('bg-BG', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      лв.
                    </span>
                  </div>
                  <Progress
                    value={(cat.totalValue / maxCategoryValue) * 100}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{cat.itemCount} артикула</span>
                    <span>{cat.totalQuantity} бр. общо</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Топ артикули по стойност */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-primary" />
              Топ 10 артикули по стойност
            </CardTitle>
            <CardDescription>Артикулите с най-голяма обща стойност</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead className="text-right">Кол.</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Стойност</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="truncate max-w-32">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {(item.quantity * item.price).toLocaleString('bg-BG', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Пълна таблица с наличности */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Пълна наличност
          </CardTitle>
          <CardDescription>Списък на всички артикули с текущи количества</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="table-container border-0 shadow-none">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>SKU</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                  <TableHead className="text-right">Ед. цена</TableHead>
                  <TableHead className="text-right">Обща стойност</TableHead>
                  <TableHead>Локация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">{item.price.toFixed(2)} лв.</TableCell>
                    <TableCell className="text-right font-medium">
                      {(item.quantity * item.price).toLocaleString('bg-BG', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      лв.
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
