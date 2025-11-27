import { FamilyApi } from "@/api/family.api";

export const cancelOrderAction = async (orderId: string, reason: string): Promise<void> => {
   try {
      await FamilyApi.put(`/orders/client/${orderId}/cancel`, { reason });
   } catch (error) {
      console.log(error);
      throw new Error("No se pudo cancelar el pedido");
   }
};
