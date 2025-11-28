import { FamilyApi } from "@/api/family.api";

export async function createCategoryAction(formData: FormData): Promise<{ success: true; data: any } | { success: false; error: string }> {
   try {
      const name = formData.get('name');
      if (!name) {
         return { success: false, error: 'El nombre es requerido' };
      }

      const { data } = await FamilyApi.post('/categories/new', formData);

      return { success: true, data };
   } catch (error) {
      console.error('Error creating category:', error);
      if (error instanceof Error) {
         return { success: false, error: error.message };
      }
      return { success: false, error: 'Error desconocido al crear categoría' };
   }
}
