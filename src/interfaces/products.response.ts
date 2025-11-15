import type { Product } from "./products.interface";

export interface ProductsResponse {
   ok: boolean;
   currentPage: number;
   totalPages: number;
   totalProducts: number;
   count: number;
   products: Product[];
}




