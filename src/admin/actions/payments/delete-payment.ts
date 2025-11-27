import { FamilyApi } from "@/api/family.api";

export const deletePayment = async (id: string) => {
   try {
      const { data } = await FamilyApi.delete(`/payments/${id}`);
      return data;
   } catch (error: any) {
      console.log(error);
      if (error.response && error.response.data) {
         throw new Error(error.response.data.msg);
      }
      throw new Error("Error al eliminar el pago");
   }
}
