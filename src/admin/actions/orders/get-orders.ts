import { FamilyApi } from "@/api/family.api";
import type { OrdersResponse } from "@/interfaces/orders.response";
import { isAxiosError } from "axios";

interface GetOrdersOptions {
   page?: number;
   limit?: number;
   status?: string;
   date?: string;
   search?: string;
}

export const getOrdersByAdmin = async ({ page = 1, limit = 10, status = '', date = '', search = '' }: GetOrdersOptions = {}): Promise<OrdersResponse> => {
   try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status && status !== 'all') params.append('status', status);
      if (date) params.append('date', date);
      if (search) params.append('search', search);

      const { data } = await FamilyApi.get<OrdersResponse>(`/orders/admin/getOrders?${params.toString()}`);
      return data;
   } catch (error: any) {
      if (isAxiosError(error)) {
         console.log(error);
         throw new Error(error.response?.data.msg || 'Error al obtener los pedidos');
      }
      throw new Error('Error al obtener los pedidos');
   }
}
