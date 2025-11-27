import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/actions/get-categories";
import { useSearchParams } from "react-router";

export const useCategories = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  return useQuery({
    queryKey: ["categories", query],
    queryFn: () => getCategoriesAction(query),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};