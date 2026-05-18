import { useState, useMemo, useRef } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import { useAuth } from '@/hooks/use-auth';
import { InventoryItem } from '@/types/inventory';
import { CategoryManager } from './CategoryManager';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Filter,
  MoreHorizontal,
  Tags,
  Download,
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const InventoryPage = () => {
  const { items, categories, addItem, bulkAddItem, updateItem, deleteItem, bulkDeleteItems, loading } = useInventory();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 5,
    unit: 'бр.',
    price: 0,
    location: '',
    description: '',
  });

  const handleExport = () => {
    const itemsToExport = selectedIds.length > 0
      ? items.filter(item => selectedIds.includes(item.id))
      : items;

    const exportData = itemsToExport.map(item => ({
      'SKU Код': item.sku,
      'Наименование': item.name,
      'Категория': item.category,
      'Количество': item.quantity,
      'Мин. количество': item.minQuantity,
      'Мярка': item.unit,
      'Цена': item.price,
      'Локация': item.location,
      'Описание': item.description || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Успешен експорт',
      description: `Бяха експортирани ${itemsToExport.length} артикула в Excel файл.`,
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const itemsToImport = jsonData.map(row => ({
          sku: String(row['SKU Код'] || row['sku'] || ''),
          name: String(row['Наименование'] || row['name'] || ''),
          category: String(row['Категория'] || row['category'] || 'Общи'),
          quantity: Number(row['Количество'] || row['quantity'] || 0),
          minQuantity: Number(row['Мин. количество'] || row['minQuantity'] || 5),
          unit: String(row['Мярка'] || row['unit'] || 'бр.'),
          price: Number(row['Цена'] || row['price'] || 0),
          location: String(row['Локация'] || row['location'] || ''),
          description: String(row['Описание'] || row['description'] || '')
        })).filter(item => item.sku && item.name); // Валидация

        if (itemsToImport.length === 0) {
          throw new Error('Няма валидни артикули за импортиране');
        }

        await bulkAddItem(itemsToImport);

        toast({
          title: 'Успешен импорт',
          description: `Бяха импортирани ${itemsToImport.length} артикула.`,
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: 'Грешка при импорт',
          description: error instanceof Error ? error.message : 'Възникна проблем при четене на файла.',
          variant: 'destructive',
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && item.quantity > 0 && item.quantity <= item.minQuantity) ||
        (stockFilter === 'out' && item.quantity === 0) ||
        (stockFilter === 'ok' && item.quantity > item.minQuantity);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchQuery, categoryFilter, stockFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteItems(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteConfirmOpen(false);
      toast({
        title: 'Успешно изтриване',
        description: `Бяха изтрити ${selectedIds.length} артикула.`,
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Грешка',
        description: 'Възникна проблем при груповото изтриване.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: 'Изчерпан', className: 'badge-out-of-stock' };
    }
    if (item.quantity <= item.minQuantity) {
      return { label: 'Ниско', className: 'badge-low-stock' };
    }
    return { label: 'Налично', className: 'badge-in-stock' };
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      sku: '',
      name: '',
      category: '',
      quantity: 0,
      minQuantity: 5,
      unit: 'бр.',
      price: 0,
      location: '',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      price: item.price,
      location: item.location,
      description: item.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        toast({
          title: 'Успешно обновено',
          description: `Артикул "${formData.name}" беше обновен.`,
        });
      } else {
        await addItem(formData);
        toast({
          title: 'Успешно добавено',
          description: `Артикул "${formData.name}" беше добавен.`,
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Грешка',
        description: 'Възникна проблем при запазване на артикула.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    try {
      await deleteItem(id);
      setDeleteConfirmId(null);
      toast({
        title: 'Изтрито',
        description: `Артикул "${item?.name}" беше изтрит.`,
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Грешка',
        description: 'Възникна проблем при изтриване на артикула.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Заглавна част */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Складови артикули</h1>
          <p className="page-description">Управлявайте артикулите в склада</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".xlsx,.xls"
                className="hidden"
              />
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setIsBulkDeleteConfirmOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Изтрий селектираните ({selectedIds.length})
                </Button>
              )}
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="w-4 h-4" />
                Импорт
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            {selectedIds.length > 0 ? `Експорт селектирани (${selectedIds.length})` : 'Експорт'}
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setIsCategoryManagerOpen(true)} className="gap-2">
                <Tags className="w-4 h-4" />
                Категории
              </Button>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Добави артикул
              </Button>
            </>
          )}
        </div>
      </div>

      <CategoryManager open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen} />

      {/* Филтри */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Търсене по име, SKU или локация..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Наличност" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички</SelectItem>
            <SelectItem value="ok">Налично</SelectItem>
            <SelectItem value="low">Ниска</SelectItem>
            <SelectItem value="out">Изчерпани</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Таблица */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Избери всички"
                />
              </TableHead>
              <TableHead className="w-24">SKU</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead className="text-right">Количество</TableHead>
              <TableHead className="text-right">Цена</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Локация</TableHead>
              {isAdmin && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 9 : 8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="w-10 h-10 mb-2 opacity-50" />
                    <p>Няма намерени артикули</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const status = getStockStatus(item);
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                        aria-label={`Избери ${item.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.price.toFixed(2)} лв.
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.location}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Редактирай
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Изтрий
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Диалог за добавяне/редактиране */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Редактиране на артикул' : 'Нов артикул'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Променете данните на артикула'
                : 'Попълнете данните за новия артикул'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU код</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="EL-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Наименование</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Въведете име на артикула"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Мин. количество</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    min="0"
                    value={formData.minQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Мярка</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="бр."
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Цена (лв.)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Локация</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Склад A, Рафт 1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание (опционално)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Допълнителна информация за артикула..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отказ
              </Button>
              <Button type="submit">
                {editingItem ? 'Запази' : 'Добави'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог за потвърждение на изтриване */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Потвърждение за изтриване</DialogTitle>
            <DialogDescription>
              Сигурни ли сте, че искате да изтриете този артикул? Това действие е необратимо.
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
      {/* Диалог за групово изтриване */}
      <Dialog open={isBulkDeleteConfirmOpen} onOpenChange={setIsBulkDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Групово изтриване</DialogTitle>
            <DialogDescription>
              Сигурни ли сте, че искате да изтриете {selectedIds.length} селектирани артикула? Това действие е необратимо.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteConfirmOpen(false)}>
              Отказ
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Изтрий всички
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
