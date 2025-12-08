import { FamilyApi } from "@/api/family.api";
import type { ProductResponseSuccess } from "@/interfaces/products.response";

export async function createProductAction(
   formData: FormData
): Promise<
   { success: true; data: ProductResponseSuccess } |
   { success: false; error: string }
> {
   try {
      const response = await FamilyApi.post<ProductResponseSuccess>('/products/new', formData, {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      });

      return { success: true, data: response.data };
   } catch (error) {
      console.error('Error creating product:', error);

      if (error instanceof Error) {
         return { success: false, error: error.message };
      }

      return { success: false, error: 'Error desconocido al crear producto' };
   }
}