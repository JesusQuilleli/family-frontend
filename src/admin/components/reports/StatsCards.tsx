import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, ShoppingBag } from "lucide-react";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import type { GeneralStats } from "@/admin/actions/reports/reports-actions";

interface StatsCardsProps {
   stats: GeneralStats | undefined;
   isLoading: boolean;
}

export const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
   if (isLoading) {
      return (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
               <Card key={i} className="animate-pulse">
                  <CardHeader className="h-16 bg-muted/50" />
                  <CardContent className="h-24 bg-muted/20" />
               </Card>
            ))}
         </div>
      );
   }

   if (!stats) return null;



   return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Ingresos Totales (Caja)</CardTitle>
               <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">
                  <PriceDisplay price={stats.totalIncome} />
               </div>
               <p className="text-xs text-muted-foreground">
                  Pagos verificados recibidos
               </p>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Valor de Ventas</CardTitle>
               <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">
                  <PriceDisplay price={stats.totalSalesValue} />
               </div>
               <p className="text-xs text-muted-foreground">
                  Total de pedidos no cancelados
               </p>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Costo de Mercancía</CardTitle>
               <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">
                  <PriceDisplay price={stats.totalCost} />
               </div>
               <p className="text-xs text-muted-foreground">
                  Costo de productos vendidos
               </p>
            </CardContent>
         </Card>

         <Card className="bg-green-50/50 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium text-green-700">Ganancia Estimada</CardTitle>
               <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-green-700">
                  <PriceDisplay price={stats.netProfit} />
               </div>
               <p className="text-xs text-green-600/80">
                  Ventas - Costos
               </p>
            </CardContent>
         </Card>
      </div>
   );
};
