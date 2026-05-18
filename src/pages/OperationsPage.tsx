import { useState } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import { OperationType } from '@/types/inventory';
import { ArrowUpCircle, ArrowDownCircle, Package, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const OperationsPage = () => {
  const { items, addOperation, getItemById } = useInventory();
  const { toast } = useToast();

  const [operationType, setOperationType] = useState<OperationType>('in');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const selectedItem = selectedItemId ? getItemById(selectedItemId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      toast({
        title: 'Грешка',
        description: 'Моля, изберете артикул.',
        variant: 'destructive',
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: 'Грешка',
        description: 'Количеството трябва да е по-голямо от 0.',
        variant: 'destructive',
      });
      return;
    }

    if (operationType === 'out' && quantity > selectedItem.quantity) {
      toast({
        title: 'Грешка',
        description: `Недостатъчна наличност. Налични: ${selectedItem.quantity} ${selectedItem.unit}`,
        variant: 'destructive',
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: 'Грешка',
        description: 'Моля, въведете причина за операцията.',
        variant: 'destructive',
      });
      return;
    }

    const previousQuantity = selectedItem.quantity;
    const newQuantity =
      operationType === 'in'
        ? previousQuantity + quantity
        : previousQuantity - quantity;

    addOperation({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemSku: selectedItem.sku,
      type: operationType,
      quantity,
      previousQuantity,
      newQuantity,
      reason: reason.trim(),
    });

    toast({
      title: 'Успешна операция',
      description: `${operationType === 'in' ? 'Приети' : 'Изписани'} ${quantity} ${selectedItem.unit} от "${selectedItem.name}"`,
    });

    // Нулиране на формата
    setSelectedItemId('');
    setQuantity(1);
    setReason('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Заглавие */}
      <div className="page-header">
        <h1 className="page-title">Складови операции</h1>
        <p className="page-description">Приемане и изписване на стока</p>
      </div>

      {/* Превключвател за тип операция */}
      <div className="flex gap-4">
        <Button
          variant={operationType === 'in' ? 'default' : 'outline'}
          onClick={() => setOperationType('in')}
          className={cn(
            'flex-1 h-24 flex-col gap-2 transition-all',
            operationType === 'in' && 'bg-success hover:bg-success/90'
          )}
        >
          <ArrowUpCircle className="w-8 h-8" />
          <span className="text-lg font-semibold">Приемане на стока</span>
        </Button>
        <Button
          variant={operationType === 'out' ? 'default' : 'outline'}
          onClick={() => setOperationType('out')}
          className={cn(
            'flex-1 h-24 flex-col gap-2 transition-all',
            operationType === 'out' && 'bg-destructive hover:bg-destructive/90'
          )}
        >
          <ArrowDownCircle className="w-8 h-8" />
          <span className="text-lg font-semibold">Изписване на стока</span>
        </Button>
      </div>

      {/* Форма за операция */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {operationType === 'in' ? (
              <ArrowUpCircle className="w-5 h-5 text-success" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-destructive" />
            )}
            {operationType === 'in' ? 'Приемане на стока' : 'Изписване на стока'}
          </CardTitle>
          <CardDescription>
            {operationType === 'in'
              ? 'Добавете стока към склада'
              : 'Изпишете стока от склада'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Избор на артикул */}
            <div className="space-y-3">
              <Label>Изберете артикул</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto py-3"
                  >
                    {selectedItem ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium">{selectedItem.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {selectedItem.sku} • {selectedItem.quantity} {selectedItem.unit}
                        </span>
                      </div>
                    ) : (
                      "Търсене на артикул по име или SKU..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Напишете име или SKU..." />
                    <CommandList>
                      <CommandEmpty>Няма намерени артикули.</CommandEmpty>
                      <CommandGroup>
                        {items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.name} ${item.sku}`}
                            onSelect={() => {
                              setSelectedItemId(item.id)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedItemId === item.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-xs text-muted-foreground">SKU: {item.sku} • Налично: {item.quantity}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Информация за избрания артикул */}
            {selectedItem && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {selectedItem.sku} • {selectedItem.category}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Текуща наличност</p>
                    <p className="font-semibold">
                      {selectedItem.quantity} {selectedItem.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Минимално</p>
                    <p className="font-semibold">
                      {selectedItem.minQuantity} {selectedItem.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Локация</p>
                    <p className="font-semibold">{selectedItem.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Количество */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={operationType === 'out' && selectedItem ? selectedItem.quantity : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Ново количество</Label>
                <div className="h-10 flex items-center px-3 rounded-md bg-muted/50 border border-input">
                  {selectedItem ? (
                    <span
                      className={cn(
                        'font-semibold',
                        operationType === 'in' ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {operationType === 'in'
                        ? selectedItem.quantity + quantity
                        : Math.max(0, selectedItem.quantity - quantity)}{' '}
                      {selectedItem.unit}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Причина */}
            <div className="space-y-2">
              <Label htmlFor="reason">Причина / Основание</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  operationType === 'in'
                    ? 'Напр.: Доставка от доставчик "Фирма ООД"'
                    : 'Напр.: Продажба на клиент / Вътрешна употреба'
                }
                rows={3}
                required
              />
            </div>

            {/* Бутон за изпращане */}
            <Button
              type="submit"
              className={cn(
                'w-full h-12 text-lg',
                operationType === 'in'
                  ? 'bg-success hover:bg-success/90'
                  : 'bg-destructive hover:bg-destructive/90'
              )}
              disabled={!selectedItem}
            >
              {operationType === 'in' ? (
                <>
                  <ArrowUpCircle className="w-5 h-5 mr-2" />
                  Приеми стока
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-5 h-5 mr-2" />
                  Изпиши стока
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
