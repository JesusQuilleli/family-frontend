import type { Product } from "@/interfaces/products.interface";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { PriceDisplay } from "../common/PriceDisplay";

interface ProductListItemProps {
   product: Product;
   onEdit?: (product: Product) => void;
   onDelete?: (id: string) => void;
   onViewDetails?: (product: Product) => void;
}

// Este componente recibe props similares a ProductCard, pero es mucho más simple.
export const ProductListItem = ({ product, onEdit, onDelete, onViewDetails }: ProductListItemProps) => {
   return (
      <div className="flex items-center justify-between w-full px-4 py-3">
         {/* Lado izquierdo: Información */}
         <div className="flex-1 min-w-0">
            <p
               className="text-sm font-medium text-foreground truncate cursor-pointer hover:underline"
               onClick={() => onViewDetails?.(product)} // El nombre es clickeable
            >
               {product.name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
               {product.category_id?.name || 'Sin categoría'}
            </p>
         </div>


         <div className="flex items-center gap-4 ml-4">
            <div className="text-right flex flex-col items-end">
               <span className="text-xs font-bold text-muted-foreground">PV</span>
               <PriceDisplay price={product.purchase_price} className="items-end" />
               <p className="text-xs text-muted-foreground mt-1">Cantidad: {product.stock}</p>
            </div>

            <Button onClick={() => onEdit?.(product)} className="text-xs" variant={"secondary"} size={"icon-sm"}><Edit /></Button>
            <Button onClick={() => onDelete?.(product._id)} className="text-xs" variant={"destructive"} size={"icon-sm"}><Trash2 /></Button>
         </div>
      </div>
   );
};