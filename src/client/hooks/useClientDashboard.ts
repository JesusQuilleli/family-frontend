import { useQuery } from "@tanstack/react-query";
import { getOrdersAction } from "@/client/actions/orders/get-orders";

export const useClientDashboard = () => {
   const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
      queryKey: ['client-recent-orders-dashboard'],
      queryFn: () => getOrdersAction({ page: 1, limit: 10 }),
   });

   // Extract unique products from orders
   const purchasedProductsMap = new Map();

   if (ordersData?.orders) {
      ordersData.orders.forEach(order => {
         order.products.forEach((item: any) => {
            if (item.product_uid && !purchasedProductsMap.has(item.product_uid._id)) {
               purchasedProductsMap.set(item.product_uid._id, item.product_uid);
            }
         });
      });
   }

   const purchasedProducts = Array.from(purchasedProductsMap.values()).slice(0, 5);

   // If no purchased products, fallback to featured (or empty)
   // For now, we'll just return purchasedProducts. If empty, UI handles it.

   return {
      recentOrders: ordersData?.orders.slice(0, 3) || [],
      featuredProducts: purchasedProducts, // Replacing featured with purchased
      isLoading: isLoadingOrders,
   };
};
