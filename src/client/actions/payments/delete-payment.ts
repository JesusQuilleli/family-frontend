import { FamilyApi } from "@/api/family.api";

export const deletePaymentAction = async (paymentId: string): Promise<void> => {
   try {
      await FamilyApi.delete(`/payments/${paymentId}`);
   } catch (error) {
      console.error(error);
      throw new Error("No se pudo eliminar el pago");
   }
};
