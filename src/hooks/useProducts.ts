import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProductsAction } from "@/actions/get-products";
import { useSearchParams } from "react-router";

export const useProducts = () => {
   const [searchParams] = useSearchParams();

   const page = Number(searchParams.get("page")) || 1;
   const limit = Number(searchParams.get("limit")) || 12;

   const categoryId = searchParams.get("categoryId") || undefined;
   const query = searchParams.get("query") || undefined;

   const query_result = useQuery({
      queryKey: ["products", { page, limit, query, categoryId }],
      queryFn: () =>
         getProductsAction({
            page,
            limit,
            categoryId,
            query
         }),
      staleTime: 1000 * 60 * 5, // 5 minutos
      placeholderData: keepPreviousData,
   });

   return {
      ...query_result,
      refetchProducts: query_result.refetch, // Exponer explícitamente el refetch
      // isLoading: query_result.isFetching, 
   };
};