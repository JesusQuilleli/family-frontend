import type { Product } from '@/types/products.interfaces';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ShoppingCart, Minus } from 'lucide-react';
import { useAuthStore } from '@/auth/store/auth.store';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onAddToCart?: (product: Product) => void;
  onRemoveFromCart?: (id: string) => void;
  onViewDetails?: (product: Product) => void;
  inCart?: boolean;
}

export const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onAddToCart,
  onRemoveFromCart,
  onViewDetails,
  inCart = false,
}: ProductCardProps) => {

  const {user} = useAuthStore();


  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-(--shadow-card-hover) group">
      <CardHeader className="p-0">
        <button
          onClick={() => onViewDetails?.(product)}
          className="relative overflow-hidden aspect-square w-full cursor-pointer group/image"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/60 px-3 py-1 rounded text-sm">
              Ver detalles
            </span>
          </div>
          <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
            ${product.price}
          </Badge>
          {product.stock < 10 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Stock bajo: {product.stock}
            </Badge>
          )}
        </button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{product.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{product.category}</Badge>
          <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {user?.role === 'admin' ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(product)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onDelete?.(product.id)}
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
                onClick={() => onRemoveFromCart?.(product.id)}
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
                <ShoppingCart className="w-4 h-4 mr-1" />
                {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};
