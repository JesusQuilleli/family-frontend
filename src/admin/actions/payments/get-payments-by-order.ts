import { FamilyApi } from "@/api/family.api";

export const getPaymentsByOrder = async (id: string) => {
   const { data } = await FamilyApi.get(`/payments/order/${id}`);
   return data.payments;
}
