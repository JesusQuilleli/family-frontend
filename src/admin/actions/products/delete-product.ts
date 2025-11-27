import { FamilyApi } from "@/api/family.api";

export async function deleteProductAction(id: string): Promise<
   { success: true; message: string } |
   { success: false; error: string }
> {
   try {
      if (!id) {
         return { success: false, error: 'ID de producto requerido' };
      }

      await FamilyApi.delete(`/products/delete/${id}`);

      return { success: true, message: 'Producto eliminado correctamente' };
   } catch (error) {
      console.error('Error deleting product:', error);

      if (error instanceof Error) {
         return { success: false, error: error.message };
      }

      return { success: false, error: 'Error desconocido al eliminar producto' };
   }
}
