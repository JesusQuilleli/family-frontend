import { useQuery } from "@tanstack/react-query";
import { getOrdersAction } from "@/client/actions/orders/get-orders";
import { getProductsAction } from "@/actions/get-products";

export const useClientDashboard = () => {
   const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
      queryKey: ['client-recent-orders'],
      queryFn: () => getOrdersAction({ page: 1, limit: 3 }),
   });

   const { data: productsData, isLoading: isLoadingProducts } = useQuery({
      queryKey: ['client-featured-products'],
      queryFn: () => getProductsAction({ page: 1, limit: 5 }),
   });

   return {
      recentOrders: ordersData?.orders || [],
      featuredProducts: productsData?.products || [],
      isLoading: isLoadingOrders || isLoadingProducts,
   };
};
