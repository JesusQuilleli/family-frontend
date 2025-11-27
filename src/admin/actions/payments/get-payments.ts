import { FamilyApi } from "@/api/family.api";
import type { Payment } from "@/interfaces/payments.interface";

interface GetPaymentsParams {
   page?: number;
   limit?: number;
   verified?: string;
   payment_method?: string;
   date?: string;
}

interface GetPaymentsResponse {
   ok: boolean;
   payments: Payment[];
   pagination: {
      currentPage: number;
      totalPages: number;
      totalPayments: number;
      count: number;
   };
}

export const getPaymentsByAdmin = async ({ page = 1, limit = 10, verified, payment_method, date }: GetPaymentsParams): Promise<GetPaymentsResponse> => {
   const params = new URLSearchParams();
   params.append('page', page.toString());
   params.append('limit', limit.toString());
   if (verified !== undefined && verified !== 'all') params.append('verified', verified);
   if (payment_method && payment_method !== 'all') params.append('payment_method', payment_method);
   if (date) params.append('date', date);

   const { data } = await FamilyApi.get<GetPaymentsResponse>(`/payments/admin/all?${params.toString()}`);
   return data;
};

export const getPaymentsStats = async () => {
   const { data } = await FamilyApi.get<{ ok: boolean, stats: any }>('/payments/admin/stats');
   return data.stats;
};
