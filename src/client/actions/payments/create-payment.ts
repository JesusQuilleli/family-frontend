import { FamilyApi } from "@/api/family.api";
import type { Payment } from "@/interfaces/payments.interface";

export const createPaymentAction = async (orderId: string, paymentData: FormData): Promise<Payment> => {
   try {
      const { data } = await FamilyApi.post<{ ok: boolean; pago: Payment }>(`/payments/${orderId}`, paymentData);
      return data.pago;
   } catch (error) {
      console.log(error);
      throw new Error("No se pudo registrar el pago");
   }
};
