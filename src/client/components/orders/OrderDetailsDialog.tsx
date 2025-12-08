import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Package, AlertCircle } from "lucide-react";

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Order } from "@/interfaces/orders.interface";
import { cancelOrderAction } from "@/client/actions/orders/cancel-order";

import { PaymentForm } from "@/client/components/payments/PaymentForm";
import { PaymentList } from "@/client/components/payments/PaymentList";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { getPaymentsByOrderAction } from "@/client/actions/payments/get-payments";
import { getImageUrl } from "@/helpers/get-image-url";
import { useQuery } from "@tanstack/react-query";
import { ImageWithLoader } from "@/components/common/ImageWithLoader";

interface OrderDetailsDialogProps {
   children: React.ReactNode;
   order: Order;
}

export const OrderDetailsDialog = ({ children, order }: OrderDetailsDialogProps) => {
   const [open, setOpen] = useState(false);
   const [isCancelling, setIsCancelling] = useState(false);
   const [showPaymentForm, setShowPaymentForm] = useState(false);
   const queryClient = useQueryClient();

   const { data: payments } = useQuery({
      queryKey: ["order-payments", order._id],
      queryFn: () => getPaymentsByOrderAction(order._id),
   });

   const hasPendingPayment = payments?.some(p => !p.verified && !p.rejectionReason);

   const statusColor = {
      pendiente: "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25",
      aprobado: "bg-green-500/15 text-green-700 hover:bg-green-500/25",
      rechazado: "bg-red-500/15 text-red-700 hover:bg-red-500/25",
      cancelado: "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25",
      completado: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25",
      pagado: "bg-green-500/15 text-green-700 hover:bg-green-500/25",
   };

   const [reason, setReason] = useState("");

   const handleCancelOrder = async () => {
      if (!reason.trim()) {
         toast.error("Por favor ingresa un motivo para la cancelación");
         return;
      }

      try {
         setIsCancelling(true);
         await cancelOrderAction(order._id, reason);
         toast.success("Pedido cancelado exitosamente");
         queryClient.invalidateQueries({ queryKey: ["client-orders"] });
         setOpen(false);
      } catch (error) {
         toast.error("Error al cancelar el pedido");
      } finally {
         setIsCancelling(false);
      }
   };

   const statusDescription: Record<string, string> = {
      pendiente: "Tu pedido está siendo verificado por el vendedor. Espera su aprobación pronto.",
      "por pagar": "¡Tu pedido fue aprobado! Por favor, registra tu pago en la sección de abajo para procesarlo.",
      abonado: "Hemos recibido pagos parciales pero aún tienes deuda pendiente. Por favor reporta el monto restante para completar tu pedido.",
      pagado: "¡Gracias por tu compra! Tu pedido está pagado y no tienes deudas pendientes.",
      completado: "¡Gracias por tu compra! Tu pedido está pagado y completado.",
      cancelado: "Este pedido ha sido cancelado.",
      rechazado: "Este pedido fue rechazado por el vendedor.",
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>{children}</DialogTrigger>
         <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] p-4 sm:p-6 rounded-lg">
            <DialogHeader>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mr-8">
                  <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl truncate">
                     <Package className="w-5 h-5 text-primary flex-shrink-0" />
                     <span className="truncate">Pedido #{order._id.slice(-6)}</span>
                  </DialogTitle>
                  <Badge
                     className={
                        statusColor[order.status as keyof typeof statusColor] ||
                        "bg-gray-500"
                     }
                  >
                     {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
               </div>
               <DialogDescription className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(order.createdAt), "PPP p", { locale: es })}
               </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[65vh] sm:max-h-[80vh] pr-4 -mr-4 sm:mr-0 sm:pr-4">
               <div className="grid gap-6 py-4 pr-4 sm:pr-0">
                  <div className="bg-muted/50 border rounded-md p-3 text-sm text-muted-foreground flex gap-2">
                     <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                     <p>{statusDescription[order.status] || "Sin información adicional."}</p>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-sm font-medium leading-none">Productos</h4>
                     <div className="space-y-4">
                        {order.products.map((item) => (
                           <div
                              key={item._id}
                              className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b pb-4 last:border-0 last:pb-0"
                           >
                              <div className="flex items-start gap-3">
                                 <ImageWithLoader
                                    src={item.product_uid && item.product_uid.image ? getImageUrl(item.product_uid.image) : '/not-image.jpg'}
                                    alt={item.product_uid?.name || 'Producto eliminado'}
                                    className="w-12 h-12 rounded-md object-cover bg-muted flex-shrink-0"
                                    fallbackSrc="/not-image.jpg"
                                 />
                                 <div className="grid gap-1">
                                    <span className="font-medium text-sm line-clamp-2">
                                       {item.product_uid?.name || 'Producto no disponible (Eliminado)'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                       Cantidad: {item.stock}
                                    </span>
                                 </div>
                              </div>
                              <div className="font-medium text-sm pl-[60px] sm:pl-0">
                                 <PriceDisplay price={item.sale_price * item.stock} className="items-end" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <Separator />

                  <div className="space-y-1.5">

                     <div className="flex justify-between font-medium text-lg pt-2">
                        <span>Total de la compra</span>
                        <PriceDisplay price={order.total} className="items-end" />
                     </div>
                     {order.status !== 'pagado' && order.remaining < order.total && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                           <span>Restante por pagar</span>
                           <PriceDisplay price={order.remaining} className="items-end" />
                        </div>
                     )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium leading-none">Pagos</h4>
                        {(order.status === "por pagar" || order.status === "abonado") && !showPaymentForm && !hasPendingPayment && (
                           <Button
                              variant="outline"
                              className="hover:bg-green-500 hover:text-white cursor-pointer"
                              size="sm"
                              onClick={() => setShowPaymentForm(true)}
                           >
                              Registrar Pago
                           </Button>
                        )}
                     </div>

                     {showPaymentForm ? (
                        <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border">
                           <div className="flex justify-between items-center mb-4">
                              <h5 className="text-sm font-medium">Nuevo Pago</h5>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 className="hover:bg-red-500 hover:text-white cursor-pointer"
                                 onClick={() => setShowPaymentForm(false)}
                              >
                                 Cancelar
                              </Button>
                           </div>
                           <PaymentForm
                              orderId={order._id}
                              remainingAmount={order.remaining}
                              onSuccess={() => setShowPaymentForm(false)}
                           />
                        </div>
                     ) : (
                        <PaymentList orderId={order._id} />
                     )}
                  </div>

                  {order.status === "pendiente" && (
                     <div className="space-y-2">
                        <Label htmlFor="reason">Motivo de cancelación</Label>
                        <Textarea
                           id="reason"
                           placeholder="Por favor indica el motivo de la cancelación..."
                           value={reason}
                           onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                           className="resize-none"
                        />
                     </div>
                  )}
               </div>
            </ScrollArea>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
               {order.status === "pendiente" ? (
                  <Button
                     variant="destructive"
                     onClick={handleCancelOrder}
                     disabled={isCancelling || !reason.trim()}
                     className="w-full sm:w-auto hover:bg-red-500 hover:text-white cursor-pointer"
                  >
                     {isCancelling ? "Cancelando..." : "Cancelar Pedido"}
                  </Button>
               ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground py-2 sm:py-0">
                     <AlertCircle className="w-4 h-4" />
                     <span>
                        {order.status === "cancelado"
                           ? "Este pedido ya fue cancelado"
                           : "No se puede cancelar este pedido"}
                     </span>
                  </div>
               )}
               <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto hover:bg-gray-500 hover:text-white cursor-pointer"
               >
                  Cerrar
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};
