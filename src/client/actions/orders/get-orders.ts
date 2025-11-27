import { FamilyApi } from "@/api/family.api";
import type { OrdersResponse } from "@/interfaces/orders.response";

export const getOrdersAction = async ({ page = 1, limit = 10, status = 'all', date = '' }: { page?: number; limit?: number; status?: string; date?: string } = {}): Promise<OrdersResponse> => {
   try {
      const queryParams = new URLSearchParams({
         page: page.toString(),
         limit: limit.toString(),
         status,
         date
      });
      const { data } = await FamilyApi.get<OrdersResponse>(`/orders/client/getOrders?${queryParams.toString()}`);

      const dataOrders = data.orders.map(order => ({
         ...order,
         products: order.products.map(product => ({
            ...product,
            product_uid: {
               ...product.product_uid,
               image: `${import.meta.env.VITE_API_URL}${product.product_uid.image}`
            }
         }))
      }))

      return {
         ok: data.ok,
         count: data.count,
         orders: dataOrders,
         totalPages: data.totalPages,
         currentPage: data.currentPage,
         totalOrders: data.totalOrders
      };
   } catch (error: any) {
      console.log(error);
      throw new Error("Error al obtener los pedidos");
   }
};
