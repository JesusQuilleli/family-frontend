import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/actions/get-categories";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesAction(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};