import { FamilyApi } from "@/api/family.api";

interface ProductOrder {
   product_uid: string;
   stock: number;
   sale_price: number;
}

interface CreateOrderPayload {
   products: ProductOrder[];
   total: number;
}

interface CreateOrderResponse {
   ok: boolean;
   msg: string;
   order?: any;
   errors?: any[];
}

export const createOrder = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
   try {
      const { data } = await FamilyApi.post<CreateOrderResponse>("/orders/client/new", payload);
      return data;
   } catch (error: any) {
      console.error("Error al crear el pedido:", error);

      if (error.response && error.response.data) {
         return error.response.data;
      }

      return {
         ok: false,
         msg: "Error inesperado al procesar el pedido",
      };
   }
};
