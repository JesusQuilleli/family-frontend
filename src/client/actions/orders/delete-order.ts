import { FamilyApi } from "@/api/family.api";

export const deleteOrder = async (id: string) => {
   try {
      const { data } = await FamilyApi.delete(`/orders/${id}`);
      return data;
   } catch (error: any) {
      console.log(error);
      if (error.response && error.response.data) {
         throw new Error(error.response.data.msg);
      }
      throw new Error("Error al eliminar la orden");
   }
}
