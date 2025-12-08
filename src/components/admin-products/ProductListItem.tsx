import { useState } from "react";
import type { Product } from "@/interfaces/products.interface";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { PriceDisplay } from "../common/PriceDisplay";

import { getImageUrl } from "@/helpers/get-image-url";

interface ProductListItemProps {
   product: Product;
   onEdit?: (product: Product) => void;
   onDelete?: (id: string) => void;
   onViewDetails?: (product: Product) => void;
}

// Este componente recibe props similares a ProductCard, pero es mucho más simple.
export const ProductListItem = ({ product, onEdit, onDelete, onViewDetails }: ProductListItemProps) => {
   const [imgSrc, setImgSrc] = useState(getImageUrl(product.image));

   return (
      <div className="flex items-start justify-between w-full px-3 py-3 gap-3">
         {/* Lado izquierdo: Imagen e Información */}
         <div className="flex items-start flex-1 min-w-0 gap-3">
            <div
               className="w-14 h-14 flex-shrink-0 cursor-pointer rounded-md overflow-hidden bg-muted border border-border"
               onClick={() => onViewDetails?.(product)}
            >
               <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgSrc('/not-image.jpg')}
               />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-0.5">
               <p
                  className="text-sm font-semibold text-foreground line-clamp-2 leading-tight cursor-pointer hover:underline mb-1"
                  onClick={() => onViewDetails?.(product)}
               >
                  {product.name}
               </p>
               <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {product.category_id?.name || 'Sin categoría'}
               </p>
            </div>
         </div>


         {/* Lado derecho: Precio y Acciones Staked */}
         <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
               <PriceDisplay price={product.sale_price} className="items-end text-sm" />
               <p className="text-[10px] text-muted-foreground mt-0.5">Stock: {product.stock}</p>
            </div>

            <div className="flex items-center gap-1">
               <Button onClick={() => onEdit?.(product)} variant="ghost" size="icon" className="h-7 w-7"><Edit className="w-4 h-4" /></Button>
               <Button onClick={() => onDelete?.(product._id)} variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
            </div>
         </div>
      </div>
   );
};