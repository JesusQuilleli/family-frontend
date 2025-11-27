import { FamilyApi } from "@/api/family.api";
import type { ProductsResponse } from "@/interfaces/products.response";

interface GetProductsOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  query?: string;
}

export const getProductsAction = async (
  options: GetProductsOptions = {}
): Promise<ProductsResponse> => {
  try {
    const { page = 1, limit = 10, categoryId, query } = options;

    const { data } = await FamilyApi.get<ProductsResponse>("/products", {
      params: {
        page,
        limit,
        categoryId,
        query
      },
    });

    // Construir URLs completas para las imágenes
    const productsWithImageUrls = data.products.map((product) => ({
      ...product,
      image: product.image
        ? `${import.meta.env.VITE_API_URL}${product.image}`
        : '', // Si no hay imagen, devuelve string vacío
    }));

    return {
      ...data,
      products: productsWithImageUrls,
    };

  } catch (error: any) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};
