import { FamilyApi } from "@/api/family.api";
import type { Order } from "@/interfaces/orders.interface";

export const getOrderByIdAction = async (id: string): Promise<Order> => {
   try {
      const { data } = await FamilyApi.get<{ ok: boolean; order: Order }>(`/orders/${id}`);

      if (!data.ok) {
         throw new Error("No se pudo obtener el pedido");
      }

      // Process image URL if present
      const processedOrder = {
         ...data.order,
         products: data.order.products.map(product => ({
            ...product,
            product_uid: product.product_uid ? {
               ...product.product_uid,
               image: product.product_uid?.image ? `${import.meta.env.VITE_API_URL}${product.product_uid.image}` : null
            } : null
         }))
      };

      return processedOrder;
   } catch (error: any) {
      console.log(error);
      throw new Error(error.response?.data?.msg || "Error al obtener el pedido");
   }
};
