import { FamilyApi } from "@/api/family.api";
import type { Payment } from "@/interfaces/payments.interface";
import { isAxiosError } from "axios";

export const verifyPayment = async (id: string): Promise<Payment> => {
   try {
      const { data } = await FamilyApi.put<{ ok: boolean, msg: string, pago: Payment }>(`/payments/${id}/verify`);
      return data.pago;
   } catch (error) {
      if (isAxiosError(error)) {
         throw new Error(error.response?.data.msg || 'Error al verificar el pago');
      }
      throw new Error('Error al verificar el pago');
   }
}

export const rejectPayment = async (id: string, reason: string): Promise<Payment> => {
   try {
      const { data } = await FamilyApi.put<{ ok: boolean, msg: string, payment: Payment }>(`/payments/${id}/reject`, { reason });
      return data.payment;
   } catch (error) {
      if (isAxiosError(error)) {
         throw new Error(error.response?.data.msg || 'Error al rechazar el pago');
      }
      throw new Error('Error al rechazar el pago');
   }
}
