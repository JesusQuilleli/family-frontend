export interface OrderUser {
   _id: string;
   name: string;
   email: string;
   phone?: string;
   clientCurrency?: string;
   tasaBs?: number;
   tasaPesos?: number;
   tasaCopToBs?: number;
   adminViewPreference?: string;
   payment_config?: {
      bank_name: string;
      account_number: string;
      account_type: string;
      phone: string;
      identification: string;
      instructions: string;
   };
}

export interface OrderProductItem {
   product_uid: {
      _id: string;
      name: string;
      sale_price: number;
      image: string | null;
   } | null;
   stock: number;
   sale_price: number;
   _id: string;
}

export interface Order {
   _id: string;
   client_uid: OrderUser;
   admin_uid: OrderUser;
   products: OrderProductItem[];
   total: number;
   subscriber: number;
   remaining: number;
   approved: boolean;
   status: string;
   rejectionReason: string | null;
   payments: any[]; // Define payment interface if needed later
   createdAt: string;
   updatedAt: string;
   __v: number;
}
