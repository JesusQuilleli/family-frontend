import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Transaction } from "@/admin/actions/reports/reports-actions";
import { Badge } from "@/components/ui/badge";

interface TransactionsTableProps {
   data: Transaction[];
}

export const TransactionsTable = ({ data }: TransactionsTableProps) => {
   return (
      <div className="rounded-md border">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Venta</TableHead>
                  <TableHead className="text-right text-muted-foreground">Costo</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead>Estado</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {data.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={7} className="h-24 text-center">
                        No hay transacciones en este periodo.
                     </TableCell>
                  </TableRow>
               ) : (
                  data.map((item) => (
                     <TableRow key={item.orderId}>
                        <TableCell>
                           {format(new Date(item.date), "dd MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                           #{item.orderId.slice(-6)}
                        </TableCell>
                        <TableCell>{item.client}</TableCell>
                        <TableCell className="text-right font-medium">
                           ${item.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                           ${item.cost.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${item.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                           ${item.profit.toFixed(2)}
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="capitalize">
                              {item.status}
                           </Badge>
                        </TableCell>
                     </TableRow>
                  ))
               )}
            </TableBody>
         </Table>
      </div>
   );
};
