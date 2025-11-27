import type { Order } from "@/interfaces/orders.interface";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteOrder } from "@/client/actions/orders/delete-order";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { PriceDisplay } from "@/components/common/PriceDisplay";

interface OrderCardProps {
   order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
   const statusColor = {
      pendiente: "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25",
      aprobado: "bg-green-500/15 text-green-700 hover:bg-green-500/25",
      rechazado: "bg-red-500/15 text-red-700 hover:bg-red-500/25",
      pagado: "bg-green-500/15 text-green-900 hover:bg-green-500/25",
   };

   const queryClient = useQueryClient();

   const deleteMutation = useMutation({
      mutationFn: deleteOrder,
      onSuccess: () => {
         toast.success("Pedido eliminado correctamente");
         queryClient.invalidateQueries({ queryKey: ['orders-client'] });
      },
      onError: (error: Error) => {
         toast.error(error.message);
      }
   });

   const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation(); // Evitar abrir el diálogo de detalles
      if (window.confirm("¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.")) {
         deleteMutation.mutate(order._id);
      }
   };

   const canDelete = ["completado", "cancelado", "rechazado"].includes(order.status);

   return (
      <OrderDetailsDialog order={order}>
         <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow group relative">
            <CardHeader className="pb-3">
               <div className="flex justify-between items-start">
                  <div>
                     <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Pedido #{order._id.slice(-6)}
                     </CardTitle>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(order.createdAt), "PPP", { locale: es })}
                     </div>
                  </div>
                  <Badge className={statusColor[order.status as keyof typeof statusColor] || "bg-gray-500"}>
                     {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
               </div>
            </CardHeader>
            <CardContent className="pb-3">
               <div className="space-y-2">
                  <div className="text-sm font-medium">Productos:</div>
                  <ul className="space-y-2">
                     {order.products.map((item) => (
                        <li key={item._id} className="flex justify-between items-start text-sm">
                           <span className="text-muted-foreground">
                              {item.stock}x {item.product_uid.name}
                           </span>
                           <PriceDisplay price={item.sale_price * item.stock} className="items-end" />
                        </li>
                     ))}
                  </ul>
               </div>
            </CardContent>
            <CardFooter className="pt-4 border-t flex justify-between items-center">
               {canDelete && (
                  <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors z-10"
                     onClick={handleDelete}
                     title="Eliminar pedido"
                  >
                     <Trash2 className="w-4 h-4" />
                  </Button>
               )}
               <div className={`flex flex-col items-end font-semibold ${!canDelete ? 'w-full' : ''}`}>
                  <span className="mt-1 text-xs text-muted-foreground font-normal">Total</span>
                  <PriceDisplay price={order.total} className="items-end" />
               </div>
            </CardFooter>
         </Card>
      </OrderDetailsDialog>
   );
};
