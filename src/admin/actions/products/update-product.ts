import { FamilyApi } from "@/api/family.api";
import type { ProductResponseSuccess } from "@/interfaces/products.response";

export async function updateProductAction(
   id: string,
   name: string,
   description: string,
   sale_price: number,
   purchase_price: number,
   category_id: string,
   stock: number,
   image?: File
): Promise<
   { success: true; data: ProductResponseSuccess } |
   { success: false; error: string }
> {
   try {
      if (!id || !name || !description || !sale_price || !purchase_price || !category_id || stock === undefined) {
         return { success: false, error: 'Faltan campos requeridos' };
      }

      const formData = new FormData();
      formData.append('category_id', category_id);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('purchase_price', purchase_price.toString());
      formData.append('sale_price', sale_price.toString());
      formData.append('stock', stock.toString());

      if (image) {
         formData.append('image', image);
      }

      const response = await FamilyApi.put<ProductResponseSuccess>(`/products/edit/${id}`, formData, {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      });

      return { success: true, data: response.data };
   } catch (error) {
      console.error('Error updating product:', error);

      if (error instanceof Error) {
         return { success: false, error: error.message };
      }

      return { success: false, error: 'Error desconocido al actualizar producto' };
   }
}
