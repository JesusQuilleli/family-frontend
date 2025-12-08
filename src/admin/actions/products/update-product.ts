import { FamilyApi } from "@/api/family.api";
import type { ProductResponseSuccess } from "@/interfaces/products.response";

export async function updateProductAction(
   id: string,
   formData: FormData
): Promise<
   { success: true; data: ProductResponseSuccess } |
   { success: false; error: string }
> {
   try {
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
