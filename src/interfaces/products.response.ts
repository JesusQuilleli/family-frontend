import type { Product } from "./products.interface";

export type ProductBackend = Product;

export interface ProductsResponse {
   ok: boolean;
   currentPage: number;
   totalPages: number;
   totalProducts: number;
   count: number;
   products: Product[];
}

export interface ProductResponseSuccess {
   ok: boolean;
   msg: string;
   newProduct: Product;
}







