import type { Category } from "@/interfaces/category.interface";

export interface Product {
   id: string;
   name: string;
   description: string;
   price: number;
   image: string;
   category: string;
   stock: number;
}

export interface ProductBackend {
   _id: string;
   user_uid: string;
   category_id: Category | null;
   categories?: Category[]; // Make optional to support legacy products not yet migrated
   name: string;
   description: string;
   purchase_price: number;
   sale_price: number;
   stock: number;
   image: string;
   createdAt?: string;
   updatedAt?: string;
}

export interface ProductFrontend {
   id: string;
   name: string;
   description: string;
   price: number;
   category: string;
   stock: number;
   image: string;
}