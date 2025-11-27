import { FamilyApi } from "@/api/family.api";

export async function deleteCategoryAction(id: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
   try {
      if (!id) {
         return { success: false, error: 'ID es requerido' };
      }

      await FamilyApi.delete(`/categories/delete/${id}`);

      return { success: true, message: 'Categoría eliminada correctamente' };
   } catch (error) {
      console.error('Error deleting category:', error);
      if (error instanceof Error) {
         return { success: false, error: error.message };
      }
      return { success: false, error: 'Error desconocido al eliminar categoría' };
   }
}
