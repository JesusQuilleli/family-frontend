// Libraries and Types
import type { ProductBackend } from '@/types/products.interfaces';

//Hooks
import { useAuthStore } from '@/auth/store/auth.store';

//Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

//Icons
import { ShoppingCart, Minus, Package, Tag } from 'lucide-react';

//Helpers
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { getImageUrl } from '@/helpers/get-image-url';


interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductBackend | null;
  inCart: boolean;
  onAddToCart?: (product: ProductBackend) => void;
  onRemoveFromCart?: (id: string) => void;
  userRole?: string;
}

export const ProductDetailDialog = ({
  open,
  onOpenChange,
  product,
  inCart,
  onAddToCart,
  onRemoveFromCart,
  userRole,
}: ProductDetailDialogProps) => {

  const { user } = useAuthStore();
  const role = userRole || user?.role;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>{product.category_id?.name || 'Sin categoría'}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">

              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/not-image.jpg';
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                <Tag className="w-3 h-3 mr-1" />
                {product.category_id?.name || 'Sin categoría'}
              </Badge>
              <Badge
                variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                <Package className="w-3 h-3 mr-1" />
                cantidad: {product.stock}
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
                  <div className="flex flex-wrap justify-end gap-2">
                    {product.categories && product.categories.length > 0 ? (
                      product.categories.map((cat, index) => {
                        const catObj = typeof cat === 'object' ? cat : null;
                        const parent = catObj && (catObj as any).parent_id ? (catObj as any).parent_id : null;
                        const displayName = parent && typeof parent === 'object' ? `${parent.name} > ${catObj?.name}` : catObj?.name || '...';

                        return (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {displayName}
                          </Badge>
                        );
                      })
                    ) : (
                      <Badge variant="outline">{product.category_id?.name || 'Sin categoría'}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Disponibilidad</span>
                  <span className="font-medium">
                    {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                  </span>
                </div>

                {role === 'cliente' && (
                  <>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Precio</span>
                      <PriceDisplay price={product.sale_price} className="items-end" />
                    </div>
                  </>)
                }

                {role === 'admin' && (
                  <>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Precio de Compra Unid.</span>
                      <PriceDisplay price={product.purchase_price} className="items-end" />
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Precio de Venta Unid.</span>
                      <PriceDisplay price={product.sale_price} className="items-end" />
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Inv (invertido)</span>
                      <PriceDisplay price={product.purchase_price * product.stock} className="items-end" />
                    </div>

                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">VnT (venta)</span>
                      <PriceDisplay price={product.sale_price * product.stock} className="items-end" />
                    </div>

                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">

              {role === 'admin' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ganancia Estimada</span>
                    <span className="font-medium text-green-600 text-2xl">
                      {((product.sale_price * product.stock) - (product.purchase_price * product.stock)).toFixed(0)}$
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Margen de Ganacia</span>
                    <span className="font-medium text-green-600 text-2xl">
                      {(((product.sale_price - product.purchase_price) / product.purchase_price) * 100).toFixed(0)}%
                    </span>
                  </div>
                </>
              )}

              {role === 'cliente' && (
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
                      variant={product.stock === 0 ? "destructive" : "default"}
                      onClick={() => onAddToCart?.(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
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