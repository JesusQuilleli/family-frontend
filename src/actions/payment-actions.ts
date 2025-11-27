import { FamilyApi } from "../api/family.api";

export interface Payment {
   _id: string;
   order_uid: {
      _id: string;
      total: number;
      subscriber: number;
      remaining: number;
      status: string;
   };
   amount: number;
   payment_method: string;
   reference?: string;
   image_checking?: string;
   verified: boolean;
   registered_by: {
      _id: string;
      name: string;
      email: string;
   };
   createdAt: string;
   updatedAt: string;
}

export interface PaymentsResponse {
   ok: boolean;
   payments: Payment[];
   totalPayments: number;
   totalPages: number;
   currentPage: number;
   count: number;
}

export const getAllPaymentsByAdmin = async (page = 1, limit = 10, verified = '', payment_method = '', client = ''): Promise<PaymentsResponse> => {
   const params = new URLSearchParams();
   params.append('page', page.toString());
   params.append('limit', limit.toString());
   if (verified) params.append('verified', verified);
   if (payment_method) params.append('payment_method', payment_method);
   if (client) params.append('client', client);

   const { data } = await FamilyApi.get<PaymentsResponse>(`/payments/admin/all?${params.toString()}`);
   return data;
}
