import type { Category } from "./category.interface";

export interface Product {
   _id: string;
   user_uid: string;
   category_id: Category | null;
   name: string;
   description: string;
   purchase_price: number;
   sale_price: number;
   stock: number;
   image: string;
   __v: number;
}