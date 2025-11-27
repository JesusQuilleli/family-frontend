import { FamilyApi } from "@/api/family.api";
import type { Payment } from "@/interfaces/payments.interface";

interface GetClientPaymentsParams {
   page?: number;
   limit?: number;
   verified?: string;
   payment_method?: string;
   date?: string;
}

interface ClientPaymentsResponse {
   ok: boolean;
   payments: Payment[];
   pagination: {
      currentPage: number;
      totalPages: number;
      totalPayments: number;
      count: number;
   };
}

export const getClientPaymentsAction = async (params: GetClientPaymentsParams = {}): Promise<ClientPaymentsResponse> => {
   try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.verified) queryParams.append('verified', params.verified);
      if (params.payment_method) queryParams.append('payment_method', params.payment_method);
      if (params.date) queryParams.append('date', params.date);

      const { data } = await FamilyApi.get<ClientPaymentsResponse>(`/payments/client/all?${queryParams.toString()}`);

      // Transform image URLs to include full API path
      const paymentsWithFullUrls = data.payments.map((payment) => ({
         ...payment,
         image_checking: payment.image_checking
            ? `${import.meta.env.VITE_API_URL}${payment.image_checking}`
            : undefined,
      }));

      return {
         ...data,
         payments: paymentsWithFullUrls
      };
   } catch (error: any) {
      console.error(error);
      throw new Error("No se pudieron obtener los pagos");
   }
};
