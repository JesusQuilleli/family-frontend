import type { ProductBackend } from '@/types/products.interfaces';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Minus, Package, Tag, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/auth/store/auth.store';

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductBackend | null;
  inCart: boolean;
  onAddToCart?: (product: ProductBackend) => void;
  onRemoveFromCart?: (id: string) => void;
}

export const ProductDetailDialog = ({
  open,
  onOpenChange,
  product,
  inCart,
  onAddToCart,
  onRemoveFromCart,
}: ProductDetailDialogProps) => {

  const { user } = useAuthStore();

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>{product.category_id.name}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
              <img
                src={product.image || '/placeholder-product.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.png';
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                <Tag className="w-3 h-3 mr-1" />
                {product.category_id.name}
              </Badge>
              <Badge
                variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                <Package className="w-3 h-3 mr-1" />
                Stock: {product.stock}
              </Badge>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'Sin descripción disponible'}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Detalles del Producto</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Categoría</span>
                  <span className="font-medium">{product.category_id.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Disponibilidad</span>
                  <span className="font-medium">
                    {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                  </span>
                </div>
                {user?.role === 'admin' && (
                  <>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Precio de Compra</span>
                      <span className="font-medium">${product.purchase_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Ganancia</span>
                      <span className="font-medium text-green-600">
                        ${(product.sale_price - product.purchase_price).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <span className="text-3xl font-bold text-primary">
                    ${product.sale_price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">USD</span>
                </div>
                {user?.role === 'admin' && (
                  <p className="text-sm text-muted-foreground">
                    Margen: {(((product.sale_price - product.purchase_price) / product.purchase_price) * 100).toFixed(0)}%
                  </p>
                )}
              </div>

              {user?.role === 'cliente' && (
                <>
                  {inCart ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => onRemoveFromCart?.(product._id)}
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Quitar del carrito
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => onAddToCart?.(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};