import { FamilyApi } from "@/api/family.api";
import type { Order } from "@/interfaces/orders.interface";
import { isAxiosError } from "axios";

export const mergeOrders = async (orderIds: string[]): Promise<Order> => {
   try {
      const { data } = await FamilyApi.post<{ ok: boolean, msg: string, order: Order }>('/orders/admin/merge', { orderIds });
      return data.order;
   } catch (error) {
      if (isAxiosError(error) && error.response) {
         throw new Error(error.response.data.msg);
      }
      throw new Error("Error inesperado al unificar pedidos");
   }
}
