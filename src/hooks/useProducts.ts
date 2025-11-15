import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/actions/get-products";
import { useSearchParams } from "react-router";

export const useProducts = () => {
   const [searchParams] = useSearchParams();

   // Parámetros de paginación
   const page = Number(searchParams.get("page")) || 1;
   const limit = Number(searchParams.get("limit")) || 10;

   // Parámetros de filtrado (opcional - por si los implementas después)
   //const categoryId = searchParams.get("category") || undefined;
   //const query = searchParams.get("query") || undefined;

   return useQuery({
      queryKey: ["products", { page, limit }],
      queryFn: () =>
         getProductsAction({
            page,
            limit,
         }),
      staleTime: 1000 * 60 * 5, // 5 minutos
   });
};