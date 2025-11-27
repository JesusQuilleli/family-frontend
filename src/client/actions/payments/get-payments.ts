import { FamilyApi } from "@/api/family.api";
import type { Payment } from "@/interfaces/payments.interface";

export const getPaymentsByOrderAction = async (orderId: string): Promise<Payment[]> => {
   try {
      const { data } = await FamilyApi.get<{ ok: boolean; payments: Payment[] }>(`/payments/order/${orderId}`);
      const payments = data.payments.map((payment) => ({
         ...payment,
         image_checking: payment.image_checking
            ? `${import.meta.env.VITE_API_URL}${payment.image_checking}`
            : undefined,
      }));
      return payments;
   } catch (error: any) {
      console.log(error);
      throw new Error("No se pudieron obtener los pagos");
   }
};
