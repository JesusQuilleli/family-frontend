import { useQuery } from "@tanstack/react-query";
import { getPaymentsStats } from "@/admin/actions/payments/get-payments";
import { getOrdersByAdmin } from "@/admin/actions/orders/get-orders";
import { getAllUsers } from "@/actions/user-actions";
import { getProductsAction } from "@/actions/get-products";

export const useAdminDashboard = () => {
   const { data: paymentStats, isLoading: isLoadingStats } = useQuery({
      queryKey: ['admin-payment-stats'],
      queryFn: getPaymentsStats,
   });

   const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
      queryKey: ['admin-recent-orders'],
      queryFn: () => getOrdersByAdmin({ page: 1, limit: 5 }),
   });

   const { data: usersData, isLoading: isLoadingUsers } = useQuery({
      queryKey: ['admin-users-count'],
      queryFn: () => getAllUsers(1, 1), // Just to get total count
   });

   const { data: productsData, isLoading: isLoadingProducts } = useQuery({
      queryKey: ['admin-top-products'],
      queryFn: () => getProductsAction({ page: 1, limit: 5 }),
   });

   // Calculate pending payments from the stats array
   const pendingPaymentsCount = paymentStats?.stats?.reduce((acc: number, curr: any) => {
      if (!curr._id.verified) {
         return acc + curr.count;
      }
      return acc;
   }, 0) || 0;

   return {
      stats: {
         totalSales: paymentStats?.verifiedAmount || 0,
         pendingPayments: pendingPaymentsCount,
         pendingOrders: ordersData?.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length || 0, // Approximation if no dedicated endpoint
         activeClients: usersData?.totalUsers || 0,
      },
      recentOrders: ordersData?.orders || [],
      topProducts: productsData?.products || [],
      isLoading: isLoadingStats || isLoadingOrders || isLoadingUsers || isLoadingProducts,
   };
};
