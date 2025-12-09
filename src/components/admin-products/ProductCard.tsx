import type { ProductBackend } from '@/interfaces/products.response';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ShoppingCart, Minus } from 'lucide-react';
import { useAuthStore } from '@/auth/store/auth.store';
import { PriceDisplay } from '../common/PriceDisplay';
import { getImageUrl } from '@/helpers/get-image-url';
import { ImageWithLoader } from '@/components/common/ImageWithLoader';

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
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-(--shadow-card-hover) group p-0 gap-0">
      <CardHeader className="p-0">
        <button
          onClick={() => onViewDetails?.(product)}
          className="relative overflow-hidden aspect-square w-full h-full cursor-pointer group/image"
        >
          <ImageWithLoader
            src={getImageUrl(product.image)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallbackSrc="/not-image.jpg"
          />
          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
            {product.stock === 0 ? (
              <span className="text-white font-bold bg-black/50 w-full text-center py-2 backdrop-blur-sm uppercase tracking-wider">
                Agotado
              </span>
            ) : (
              <span className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/60 px-3 py-1 rounded text-sm">
                Ver detalles
              </span>
            )}
          </div>
          {product.stock > 0 && product.stock < 10 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Poca cantidad: {product.stock}
            </Badge>
          )}
        </button>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{product.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{product.description}</p>
        <div className="mb-3 flex items-center justify-between mt-auto">
          <PriceDisplay price={product.sale_price} className="items-start" />
          <span className="text-xs font-bold"><span className='text-[10px] font-semibold text-muted-foreground'>Cantidad:</span> {product.stock}</span>
        </div>

        {/* Categories Fixed Height Row */}
        <div className="flex items-center gap-1.5 h-6 overflow-hidden">
          {product.categories && product.categories.length > 0 ? (
            <>
              {product.categories.slice(0, 2).map((cat) => {
                const catObj = typeof cat === 'object' ? cat : null;
                const parent = catObj && (catObj as any).parent_id ? (catObj as any).parent_id : null;
                const displayName = parent && typeof parent === 'object' ? `${parent.name} > ${catObj?.name}` : catObj?.name || '...';

                return (
                  <Badge
                    key={typeof cat === 'object' ? cat._id : String(cat)}
                    variant="secondary"
                    className="truncate max-w-[130px] px-1.5 py-0 text-[10px] font-normal border-border/50"
                    title={displayName}
                  >
                    {displayName}
                  </Badge>
                );
              })}
              {product.categories.length > 2 && (
                <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] h-5 min-w-[24px] justify-center bg-background">
                  +{product.categories.length - 2}
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="secondary" className="truncate max-w-[120px] px-1.5 py-0 text-[10px] font-normal text-muted-foreground bg-muted/50" title={product.category_id?.name}>
              {product.category_id?.name || 'Sin categoría'}
            </Badge>
          )}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCart?.(product._id);
                }}
              >
                <Minus className="w-4 h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Quitar del carrito</span>
                <span className="inline sm:hidden">Quitar</span>
              </Button>
            ) : (
              <Button
                variant={product.stock === 0 ? "destructive" : "default"}
                size="sm"
                className="flex-1"
                onClick={() => onAddToCart?.(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">
                  {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
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
