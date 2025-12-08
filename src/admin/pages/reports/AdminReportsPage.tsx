import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { getGeneralStatsAction, getSalesChartAction, getTransactionsReportAction } from "@/admin/actions/reports/reports-actions";
import { StatsCards } from "@/admin/components/reports/StatsCards";
import { SalesChart } from "@/admin/components/reports/SalesChart";
import { TransactionsTable } from "@/admin/components/reports/TransactionsTable";
import { PrintableReport } from "@/admin/components/reports/PrintableReport";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Calendar } from "lucide-react";
import { startOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";

export const AdminReportsPage = () => {
   const [period, setPeriod] = useState<string>("month");
   const [dateRange] = useState({
      start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd")
   });

   const printableRef = useRef<HTMLDivElement>(null);

   const { data: stats, isLoading: loadingStats } = useQuery({
      queryKey: ['admin-reports-stats'],
      queryFn: getGeneralStatsAction
   });

   const { data: chartData, isLoading: loadingChart } = useQuery({
      queryKey: ['admin-reports-chart', period],
      queryFn: () => getSalesChartAction(period as any)
   });

   // Para la tabla, usaremos por defecto el mes actual si no se selecciona rango (simplificado)
   const { data: transactions, isLoading: loadingTable } = useQuery({
      queryKey: ['admin-reports-transactions', dateRange],
      queryFn: () => getTransactionsReportAction(dateRange.start, dateRange.end)
   });

   const handlePrint = useReactToPrint({
      contentRef: printableRef,
      documentTitle: `Reporte Financiero - ${dateRange.start}`,
   });

   return (
      <div className="p-4 md:p-8 space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Reportes y Finanzas</h1>
               <p className="text-muted-foreground">
                  Visualiza tus ganancias, ingresos y genera reportes contables.
               </p>
            </div>
            <div className="flex items-center gap-2">
               <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[180px]">
                     <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="month">Este Mes</SelectItem>
                     <SelectItem value="week">Esta Semana</SelectItem>
                     <SelectItem value="day">Hoy</SelectItem>
                  </SelectContent>
               </Select>
               <Button onClick={handlePrint} variant="outline" className="gap-2">
                  <Printer className="w-4 h-4" />
                  Imprimir Reporte
               </Button>
            </div>
         </div>

         {/* Stats Cards */}
         <StatsCards stats={stats} isLoading={loadingStats} />

         {/* Charts */}
         <SalesChart data={chartData} isLoading={loadingChart} />

         {/* Transactions Table */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-semibold">Detalle de Transacciones (Mes Actual)</h2>
               <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(dateRange.start), "dd MMM", { locale: es })} - {format(new Date(dateRange.end), "dd MMM", { locale: es })}</span>
               </div>
            </div>
            {loadingTable ? (
               <div className="h-32 flex items-center justify-center border rounded">
                  <span className="text-muted-foreground">Cargando datos...</span>
               </div>
            ) : (
               <TransactionsTable data={transactions || []} />
            )}
         </div>

         {/* Hidden Printable Component */}
         <div className="hidden">
            <PrintableReport
               ref={printableRef}
               stats={stats || { totalIncome: 0, totalSalesValue: 0, totalCost: 0, netProfit: 0, ordersCount: 0 }}
               transactions={transactions || []}
               period={format(new Date(), "MMMM yyyy", { locale: es })}
            />
         </div>
      </div>
   );
};
