import { FamilyApi } from "../api/family.api";

export interface Order {
   _id: string;
   client_uid: {
      _id: string;
      name: string;
      email: string;
   };
   admin_uid: {
      _id: string;
      name: string;
      email: string;
   };
   products: {
      product_uid: {
         _id: string;
         name: string;
         sale_price: number;
         image: string;
      };
      stock: number;
      price: number;
      _id: string;
   }[];
   total: number;
   subscriber: number;
   remaining: number;
   status: string;
   approved?: boolean;
   createdAt: string;
   updatedAt: string;
}

export interface OrdersResponse {
   ok: boolean;
   orders: Order[];
   totalOrders: number;
   totalPages: number;
   currentPage: number;
   count: number;
}

export const getOrdersByAdmin = async (page = 1, limit = 10, status = '', date = '', search = '', client = ''): Promise<OrdersResponse> => {
   const params = new URLSearchParams();
   params.append('page', page.toString());
   params.append('limit', limit.toString());
   if (status) params.append('status', status);
   if (date) params.append('date', date);
   if (search) params.append('search', search);
   if (client) params.append('client', client);

   const { data } = await FamilyApi.get<OrdersResponse>(`/orders/admin/getOrders?${params.toString()}`);
   return data;
}

export const sendPaymentReminder = async (orderId: string) => {
   const { data } = await FamilyApi.post(`/orders/admin/reminder/${orderId}`);
   return data;
}

export const sendBulkPaymentReminders = async () => {
   const { data } = await FamilyApi.post(`/notifications/remind-payments`);
   return data;
}
