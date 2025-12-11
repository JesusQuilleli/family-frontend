import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ChartDataPoint } from "@/admin/actions/reports/reports-actions";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface SalesChartProps {
   data: ChartDataPoint[] | undefined;
   isLoading: boolean;
}

export const SalesChart = ({ data, isLoading }: SalesChartProps) => {
   if (isLoading) {
      return (
         <Card className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Cargando gráfico...</p>
         </Card>
      );
   }

   if (!data || data.length === 0) {
      return (
         <Card className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos suficientes para el gráfico</p>
         </Card>
      );
   }

   const formatXAxis = (tickItem: string) => {
      try {
         // Detectar si es YYYY-MM o YYYY-MM-DD
         if (tickItem.length === 7) {
            // Mes (YYYY-MM)
            return format(parseISO(`${tickItem}-01`), 'MMM yyyy', { locale: es });
         }
         return format(parseISO(tickItem), 'dd MMM', { locale: es });
      } catch (e) {
         return tickItem;
      }
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Historial de Ventas y Ganancias</CardTitle>
            <CardDescription>Comparativa de ingresos brutos vs ganancia neta.</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="h-[350px] w-full min-w-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart
                     data={data}
                     margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                     />
                     <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                     />
                     <Tooltip
                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                        labelFormatter={formatXAxis}
                     />
                     <Legend />
                     <Area
                        type="monotone"
                        dataKey="sales"
                        name="Ventas"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                     />
                     <Area
                        type="monotone"
                        dataKey="profit"
                        name="Ganancia"
                        stroke="#16a34a"
                        fill="#22c55e"
                        fillOpacity={0.2}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </CardContent>
      </Card>
   );
};
