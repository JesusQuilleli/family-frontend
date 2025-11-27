import type { Order } from "./orders.interface";

export interface OrdersResponse {
   ok: boolean;
   count: number;
   orders: Order[];
   totalPages: number;
   currentPage: number;
   totalOrders: number;
}
