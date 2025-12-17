import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrderByIdAction } from "@/client/actions/orders/get-order-by-id";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ImageWithLoader } from "@/components/common/ImageWithLoader";
import { getImageUrl } from "@/helpers/get-image-url";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { Separator } from "@/components/ui/separator";
import { PaymentList } from "@/client/components/payments/PaymentList";

import { toast } from "sonner";
import { cancelOrderAction } from "@/client/actions/orders/cancel-order";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const ClientOrderDetailsPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   const { data: order, isLoading, isError, error } = useQuery({
      queryKey: ['order-details', id],
      queryFn: () => getOrderByIdAction(id!),
      enabled: !!id,
   });

   if (isLoading) {
      return (
         <div className="container mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2 space-y-4">
                  <Skeleton className="h-64 rounded-lg" />
                  <Skeleton className="h-48 rounded-lg" />
               </div>
               <div className="space-y-4">
                  <Skeleton className="h-64 rounded-lg" />
               </div>
            </div>
         </div>
      );
   }

   if (isError || !order) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Error al cargar el pedido</h2>
            <p className="text-muted-foreground mb-4">{error?.message || "No se pudo encontrar el pedido solicitado."}</p>
            <Button onClick={() => navigate('/client/pedidos')}>Volver a mis pedidos</Button>
         </div>
      );
   }

   const statusColor = {
      pendiente: "bg-yellow-500/15 text-yellow-700",
      "por pagar": "bg-blue-500/15 text-blue-700",
      abonado: "bg-orange-500/15 text-orange-700",
      pagado: "bg-green-500/15 text-green-700",
      completado: "bg-green-500/15 text-green-900",
      cancelado: "bg-gray-500/15 text-gray-700",
      rechazado: "bg-red-500/15 text-red-700",
   } as const; // Added as const to fix type inference if needed, though simpler is fine

   const handleCancelOrder = async () => {
      try {
         await cancelOrderAction(order._id, "Cancelado por el cliente");
         toast.success("Pedido cancelado exitosamente");
         queryClient.invalidateQueries({ queryKey: ["order-details", id] });
         queryClient.invalidateQueries({ queryKey: ["client-orders"] });
      } catch (error) {
         toast.error("Error al cancelar el pedido");
      }
   };

   return (
      <div className="min-h-screen bg-muted/20 pb-12">
         {/* Header */}
         <header className="bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
               <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate('/client/pedidos')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a mis pedidos
               </Button>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                           Pedido #{order._id.slice(-6)}
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                           <Calendar className="w-3.5 h-3.5" />
                           {format(new Date(order.createdAt), "PPP p", { locale: es })}
                        </p>
                     </div>
                  </div>
                  <Badge className={`px-4 py-1.5 text-sm font-medium ${statusColor[order.status as keyof typeof statusColor] || "bg-gray-500"}`}>
                     {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
               </div>
            </div>
         </header>

         <main className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

               {/* Left Column: Details */}
               <div className="lg:col-span-8 space-y-6">

                  {/* Products Card */}
                  <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b bg-muted/30">
                        <h3 className="font-semibold flex items-center gap-2">
                           <Package className="w-4 h-4 text-muted-foreground" />
                           Productos ({order.products.length})
                        </h3>
                     </div>
                     <div className="divide-y">
                        {order.products.map((item) => (
                           <div key={item._id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 hover:bg-muted/10 transition-colors">
                              <ImageWithLoader
                                 src={item.product_uid && item.product_uid.image ? getImageUrl(item.product_uid.image) : '/not-image.jpg'}
                                 alt={item.product_uid?.name || 'Producto eliminado'}
                                 className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-muted border flex-shrink-0"
                                 fallbackSrc="/not-image.jpg"
                              />
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-medium text-base sm:text-lg text-foreground line-clamp-2">
                                    {item.product_uid?.name || 'Producto no disponible'}
                                 </h4>
                                 <p className="text-sm text-muted-foreground mt-1">
                                    Cantidad: <span className="font-semibold text-foreground">{item.stock}</span>
                                 </p>
                                 <div className="mt-2 flex justify-between items-end">
                                    <div className="text-sm text-muted-foreground">
                                       Precio unitario: <PriceDisplay price={item.sale_price} className="inline-flex" />
                                    </div>
                                    <div className="text-right">
                                       <p className="text-xs text-muted-foreground">Subtotal</p>
                                       <PriceDisplay price={item.sale_price * item.stock} className="text-lg font-bold text-primary" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Shipping Info Placeholder (if needed in future) */}
                  {/* <div className="bg-card rounded-xl border shadow-sm p-6"> ... </div> */}

               </div>

               {/* Right Column: Payments & Actions */}
               <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

                  {/* Financial Summary */}
                  {/* Financial Summary */}
                  {/* Show only if order is NOT in 'por pagar' or 'abonado' (meaning it's paid, completed, cancelled, etc.) */}
                  {order.status !== 'por pagar' && order.status !== 'abonado' && (
                     <div className="bg-card rounded-xl border shadow-sm p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                           <CreditCard className="w-4 h-4 text-muted-foreground" />
                           Resumen Financiero
                        </h3>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <PriceDisplay price={order.total} />
                           </div>
                           <Separator />
                           <div className="flex justify-between items-center text-lg font-bold">
                              <span>Total a Pagar</span>
                              <PriceDisplay price={order.total} />
                           </div>

                           <div className="mt-4 pt-4 border-t space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                 <span className="text-muted-foreground">Pagado</span>
                                 <PriceDisplay price={order.total - order.remaining} className="text-green-600 font-medium" />
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                 <span className="text-muted-foreground">Restante</span>
                                 <PriceDisplay price={order.remaining} className="text-red-500 font-bold" />
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Payment Action - Only for 'por pagar' or 'abonado' */}
                  <div className="mt-6">
                     {(order.status === 'por pagar' || order.status === 'abonado') && (
                        <Button
                           className="w-full bg-red-600 hover:bg-red-700 text-white uppercase font-bold"
                           size="lg"
                           onClick={() => navigate(`/client/pedidos/${order._id}/pagar`)}
                        >
                           <CreditCard className="w-4 h-4 mr-2" />
                           PAGAR
                        </Button>
                     )}
                  </div>
                  <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b bg-muted/30">
                        <h3 className="font-semibold text-sm">Historial de Pagos</h3>
                     </div>
                     <div className="p-0">
                        <PaymentList orderId={order._id} />
                     </div>
                  </div>

                  {/* Cancel Action */}
                  {order.status === 'pendiente' && (
                     <div className="bg-card rounded-xl border border-destructive/20 shadow-sm p-6">
                        <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" />
                           Zona de Peligro
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                           Si deseas cancelar tu pedido, puedes hacerlo aquí siempre y cuando aún esté en estado 'Pendiente'.
                        </p>

                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full">
                                 Cancelar Pedido
                              </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                              <AlertDialogHeader>
                                 <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                    Esta acción no se puede deshacer. El pedido será cancelado permanentemente.
                                 </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                 <AlertDialogCancel>Volver</AlertDialogCancel>
                                 <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Sí, cancelar pedido
                                 </AlertDialogAction>
                              </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  )}

               </div>
            </div>
         </main>
      </div>
   );
};
