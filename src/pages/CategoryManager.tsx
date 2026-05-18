import { useState } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, AlertCircle, Search } from 'lucide-react';
import { Category } from '@/types/inventory';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CategoryManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
    const { categories, addCategory, updateCategory, deleteCategory } = useInventory();
    const { toast } = useToast();

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await addCategory(newCategoryName);
            setNewCategoryName('');
            toast({
                title: 'Успех',
                description: 'Категорията е добавена успешно.',
            });
        } catch (error) {
            toast({
                title: 'Грешка',
                description: error instanceof Error ? error.message : 'Грешка при добавяне на категория',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !editingCategory.name.trim()) return;

        try {
            await updateCategory(editingCategory.id, editingCategory.name);
            setIsEditOpen(false);
            setEditingCategory(null);
            toast({
                title: 'Успех',
                description: 'Категорията е обновена успешно.',
            });
        } catch (error) {
            toast({
                title: 'Грешка',
                description: error instanceof Error ? error.message : 'Грешка при обновяване на категория',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteCategory = async () => {
        if (!deleteId) return;

        try {
            await deleteCategory(deleteId);
            setDeleteId(null);
            toast({
                title: 'Успех',
                description: 'Категорията е изтрита успешно.',
            });
        } catch (error) {
            toast({
                title: 'Грешка',
                description: error instanceof Error ? error.message : 'Грешка при изтриване на категория',
                variant: 'destructive',
            });
        }
    };

    const openEdit = (category: Category) => {
        setEditingCategory({ ...category }); // Клониране за избягване на директна мутация
        setIsEditOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    <div className="p-6 pb-2">
                        <DialogHeader>
                            <DialogTitle>Управление на категории</DialogTitle>
                            <DialogDescription>
                                Добавяне, разглеждане и редактиране на продуктови категории.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col gap-6 p-6 pt-0">
                        {/* Секция за добавяне на нова категория */}
                        <form onSubmit={handleAddCategory} className="space-y-3">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="new-category" className="text-sm font-medium">Нова категория</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="new-category"
                                        placeholder="Име на категория..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="focus-visible:ring-offset-0 focus-visible:ring-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!newCategoryName.trim()} className="shrink-0">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* Секция със списък и търсене */}
                        <div className="flex flex-col flex-1 gap-3 min-h-0">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Списък с категории</Label>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Търсене в списъка..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 focus-visible:ring-offset-0 focus-visible:ring-1"
                                />
                            </div>

                            <div className="border rounded-md overflow-hidden flex-1 flex flex-col min-h-0">
                                <div className="overflow-y-auto flex-1">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                            <TableRow>
                                                <TableHead>Име</TableHead>
                                                <TableHead className="text-right w-24">Артикули</TableHead>
                                                <TableHead className="w-24"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCategories.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                                                        {categories.length === 0 ? 'Няма добавени категории' : 'Няма намерени резултати'}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredCategories.map((category) => (
                                                    <TableRow key={category.id} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium">{category.name}</TableCell>
                                                        <TableCell className="text-right">{category.itemCount}</TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                                    onClick={() => openEdit(category)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    onClick={() => setDeleteId(category.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Диалог за редактиране */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Редактиране на категория</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCategory}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Име на категория</Label>
                                <Input
                                    id="edit-name"
                                    value={editingCategory?.name || ''}
                                    onChange={(e) =>
                                        setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)
                                    }
                                    required
                                    className="focus-visible:ring-offset-0 focus-visible:ring-1"
                                />
                            </div>
                            <div className="text-sm text-yellow-600 flex gap-2 items-start bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-900/30">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Тъй като категориите са свързани по име, промяната тук ще обнови категорията на всички свързани {editingCategory?.itemCount} артикула!</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Отказ
                            </Button>
                            <Button type="submit">Запази промените</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Потвърждение за изтриване */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Искате ли да изтриете тази категория?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Това действие е необратимо. Ако категорията съдържа артикули, изтриването няма да бъде позволено.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отказ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Изтрий
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
