import { FamilyApi } from "@/api/family.api";

export async function updateCategoryAction(id: string, formData: FormData): Promise<{ success: true; data: any } | { success: false; error: string }> {
   try {
      const name = formData.get('name');
      if (!id || !name) {
         return { success: false, error: 'ID y nombre son requeridos' };
      }

      const { data } = await FamilyApi.put(`/categories/edit/${id}`, formData);

      return { success: true, data };
   } catch (error) {
      console.error('Error updating category:', error);
      if (error instanceof Error) {
         return { success: false, error: error.message };
      }
      return { success: false, error: 'Error desconocido al actualizar categoría' };
   }
}
