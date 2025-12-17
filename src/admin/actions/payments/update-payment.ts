import { FamilyApi } from "@/api/family.api";

export const verifyPayment = async (paymentId: string) => {
   const { data } = await FamilyApi.post(`/payments/${paymentId}/verify`);
   return data;
}

export const rejectPayment = async (paymentId: string, reason: string) => {
   const { data } = await FamilyApi.post(`/payments/${paymentId}/reject`, { reason });
   return data;
}
