import { FamilyApi } from "@/api/family.api";
import type { Order } from "@/interfaces/orders.interface";

interface OrdersResponse {
   ok: boolean;
   count: number;
   orders: Order[];
   totalPages: number;
   currentPage: number;
   totalOrders: number;
}

interface OrdersFilters {
   status?: string;
   date?: string;
   search?: string;
   client?: string;
   page?: number;
   limit?: number;
}

export const getOrdersByAdmin = async (filters: OrdersFilters = {}): Promise<OrdersResponse> => {
   const params = new URLSearchParams();
   if (filters.status) params.append('status', filters.status);
   if (filters.date) params.append('date', filters.date);
   if (filters.search) params.append('search', filters.search);
   if (filters.client) params.append('client', filters.client);
   if (filters.page) params.append('page', filters.page.toString());
   if (filters.limit) params.append('limit', filters.limit.toString());

   const { data } = await FamilyApi.get(`/orders/admin/getOrders?${params.toString()}`);
   return data;
}
