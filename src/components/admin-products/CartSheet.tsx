import type { Product } from '../../types/products.interfaces';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: Product[];
  onRemoveItem: (id: string) => void;
  onViewDetails: (product: Product) => void;
}

export const CartSheet = ({
  open,
  onOpenChange,
  cartItems,
  onRemoveItem,
  onViewDetails,
}: CartSheetProps) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + tax;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
          <SheetDescription>
            {cartItems.length === 0
              ? 'Tu carrito está vacío'
              : `${cartItems.length} producto${cartItems.length !== 1 ? 's' : ''} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Agrega productos para comenzar
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <button
                      onClick={() => onViewDetails(item)}
                      className="shrink-0 w-20 h-20 rounded-md overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg">
                Proceder al Pago
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
