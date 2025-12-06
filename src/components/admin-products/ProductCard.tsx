import type { ProductBackend } from '@/interfaces/products.response';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ShoppingCart, Minus } from 'lucide-react';
import { useAuthStore } from '@/auth/store/auth.store';
import { PriceDisplay } from '../common/PriceDisplay';
import { getImageUrl } from '@/helpers/get-image-url';

interface ProductCardProps {
  product: ProductBackend;
  onEdit?: (product: ProductBackend) => void;
  onDelete?: (id: string) => void;
  onAddToCart?: (product: ProductBackend) => void;
  onRemoveFromCart?: (id: string) => void;
  onViewDetails?: (product: ProductBackend) => void;
  inCart?: boolean;
  userRole?: string;
}

export const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onAddToCart,
  onRemoveFromCart,
  onViewDetails,
  inCart = false,
  userRole,
}: ProductCardProps) => {

  const { user } = useAuthStore();
  const role = userRole || user?.role;

  //console.log(product.image);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-(--shadow-card-hover) group p-0 gap-0">
      <CardHeader className="p-0">
        <button
          onClick={() => onViewDetails?.(product)}
          className="relative overflow-hidden aspect-square w-full h-full cursor-pointer group/image"
        >
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/60 px-3 py-1 rounded text-sm">
              Ver detalles
            </span>
          </div>
          {product.stock < 10 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Poca cantidad: {product.stock}
            </Badge>
          )}
        </button>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{product.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        <div className="mb-3">
          <PriceDisplay price={product.sale_price} className="items-start" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{product.category_id?.name || 'Sin categoría'}</Badge>
          <span className="text-xs text-muted-foreground">Cantidad: {product.stock}</span>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2">
        {role === 'admin' ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 cursor-pointer"
              onClick={() => onEdit?.(product)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 cursor-pointer"
              onClick={() => onDelete?.(product._id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </>
        ) : (
          <>
            {inCart ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onRemoveFromCart?.(product._id)}
              >
                <Minus className="w-4 h-4 mr-1" />
                Quitar del carrito
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onAddToCart?.(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">
                  {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </span>
                <span className="inline sm:hidden">
                  {product.stock === 0 ? 'Agotado' : 'Agregar'}
                </span>
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};
