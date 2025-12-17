import { FamilyApi } from '@/api/family.api';

export const approveOrder = async (id: string) => {
   const { data } = await FamilyApi.put(`/orders/admin/approve/${id}`);
   return data;
}

export const rejectOrder = async (id: string, reason: string) => {
   const { data } = await FamilyApi.put(`/orders/admin/${id}/reject`, { reason });
   return data;
}

export const cancelOrder = async (id: string, reason: string) => {
   const { data } = await FamilyApi.put(`/orders/admin/${id}/cancel`, { reason });
   return data;
}

export const updateOrderStatus = async (id: string, status: string) => {
   const { data } = await FamilyApi.put(`/orders/admin/${id}/status`, { status });
   return data;
}

export const removeProductFromOrder = async (orderId: string, itemId: string) => {
   const { data } = await FamilyApi.delete(`/orders/admin/${orderId}/product/${itemId}`);
   return data;
}
