import { FamilyApi } from "@/api/family.api";
import type { Order } from "@/interfaces/orders.interface";
import { isAxiosError } from "axios";

export const approveOrder = async (id: string): Promise<Order> => {
   try {
      const { data } = await FamilyApi.put<{ ok: boolean, msg: string, pedido: Order }>(`/orders/admin/approve/${id}`);
      return data.pedido;
   } catch (error: any) {
      console.log(error);
      if (isAxiosError(error)) {
         throw new Error(error.response?.data.msg || 'Error al aprobar el pedido');
      }
      throw new Error('Error al aprobar el pedido');
   }
}

export const rejectOrder = async (id: string, reason: string): Promise<Order> => {
   try {
      const { data } = await FamilyApi.put<{ ok: boolean, msg: string, order: Order }>(`/orders/admin/${id}/reject`, { reason });
      return data.order;
   } catch (error: any) {
      console.log(error);
      if (isAxiosError(error)) {
         throw new Error(error.response?.data.msg || 'Error al rechazar el pedido');
      }
      throw new Error('Error al rechazar el pedido');
   }
}

export const cancelOrder = async (id: string, reason?: string): Promise<Order> => {
   try {
      const { data } = await FamilyApi.put<{ ok: boolean, msg: string, order: Order }>(`/orders/admin/${id}/cancel`, { reason });
      return data.order;
   } catch (error: any) {
      if (isAxiosError(error)) {
         throw new Error(error.response?.data.msg || 'Error al cancelar el pedido');
      }
      throw new Error('Error al cancelar el pedido');
   }
}

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
   try {
      const { data } = await FamilyApi.put<{ ok: boolean, msg: string, order: Order }>(`/orders/admin/${id}/status`, { status });
      return data.order;
   } catch (error: any) {
      if (isAxiosError(error)) {
         throw new Error(error.response?.data.msg || 'Error al actualizar el estado');
      }
      throw new Error('Error al actualizar el estado');
   }
}
