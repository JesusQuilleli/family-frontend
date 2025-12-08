import React from 'react';
import type { GeneralStats, Transaction } from "@/admin/actions/reports/reports-actions";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PrintableReportProps {
   stats: GeneralStats;
   transactions: Transaction[];
   period: string; // "Noviembre 2025" or range
}

// Este componente usa estilos inline o clases standard para asegurar que se imprima bien (backgrounds etc a veces se pierden sin settings)
export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(({ stats, transactions, period }, ref) => {
   return (
      <div ref={ref} className="p-8 bg-white text-black print:block hidden">
         {/* Encabezado */}
         <div className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold mb-2">Reporte Financiero</h1>
            <p className="text-gray-600">Generado el: {format(new Date(), "PPpp", { locale: es })}</p>
            <p className="text-gray-600">Periodo: <strong>{period}</strong></p>
         </div>

         {/* Resumen */}
         <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wide border-l-4 border-black pl-2">Resumen General</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
               <div className="p-4 border rounded bg-gray-50">
                  <span className="block text-sm text-gray-500 uppercase">Ingresos</span>
                  <span className="block text-2xl font-bold">${stats.totalIncome.toFixed(2)}</span>
               </div>
               <div className="p-4 border rounded bg-gray-50">
                  <span className="block text-sm text-gray-500 uppercase">Ventas</span>
                  <span className="block text-2xl font-bold">${stats.totalSalesValue.toFixed(2)}</span>
               </div>
               <div className="p-4 border rounded bg-gray-50">
                  <span className="block text-sm text-gray-500 uppercase">Costos</span>
                  <span className="block text-2xl font-bold">${stats.totalCost.toFixed(2)}</span>
               </div>
               <div className="p-4 border rounded bg-gray-100">
                  <span className="block text-sm text-gray-500 uppercase">Ganancia Neta</span>
                  <span className="block text-2xl font-bold">${stats.netProfit.toFixed(2)}</span>
               </div>
            </div>
         </div>

         {/* Detalle */}
         <div>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wide border-l-4 border-black pl-2">Detalle de Transacciones</h2>
            <table className="w-full text-left border-collapse text-sm">
               <thead>
                  <tr className="border-b-2 border-black">
                     <th className="py-2">Fecha</th>
                     <th className="py-2">Pedido</th>
                     <th className="py-2">Cliente</th>
                     <th className="py-2 text-right">Venta</th>
                     <th className="py-2 text-right">Costo</th>
                     <th className="py-2 text-right">Ganancia</th>
                  </tr>
               </thead>
               <tbody>
                  {transactions.map((t, idx) => (
                     <tr key={t.orderId} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                        <td className="py-2">{format(new Date(t.date), "dd/MM/yyyy")}</td>
                        <td className="py-2 font-mono">#{t.orderId.slice(-6)}</td>
                        <td className="py-2">{t.client}</td>
                        <td className="py-2 text-right">${t.total.toFixed(2)}</td>
                        <td className="py-2 text-right text-gray-600">${t.cost.toFixed(2)}</td>
                        <td className="py-2 text-right font-bold">${t.profit.toFixed(2)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Footer */}
         <div className="mt-12 pt-4 border-t text-center text-xs text-gray-400">
            <p>Reporte generado por App Family Shop</p>
         </div>
      </div>
   );
});

PrintableReport.displayName = 'PrintableReport';
