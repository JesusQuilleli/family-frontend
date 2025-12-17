import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrderByIdAction } from "@/client/actions/orders/get-order-by-id";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, CreditCard } from "lucide-react";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { PaymentForm } from "@/client/components/payments/PaymentForm";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export const ClientOrderPaymentPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   const { data: order, isLoading, isError, error } = useQuery({
      queryKey: ['order-payment', id],
      queryFn: () => getOrderByIdAction(id!),
      enabled: !!id,
   });

   if (isLoading) {
      return (
         <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 rounded-lg" />
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

   return (
      <div className="min-h-screen bg-muted/20 pb-12">
         {/* Header */}
         <header className="bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 max-w-2xl">
               <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(`/client/pedidos/${order._id}`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al detalle del pedido
               </Button>
               <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                        <h1 className="text-xl font-bold text-foreground">
                           Registrar Pago
                        </h1>
                        <p className="text-sm text-muted-foreground">
                           Pedido #{order._id.slice(-6)}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </header>

         <main className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">

               <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                     <Package className="w-5 h-5 text-muted-foreground" />
                     Resumen del Pedido
                  </h3>

                  <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total del Pedido</span>
                        <PriceDisplay price={order.total} />
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Ya Pagado</span>
                        <PriceDisplay price={order.total - order.remaining} className="text-green-600 font-medium" />
                     </div>
                     <Separator />
                     <div className="flex justify-between items-center text-base font-bold">
                        <span>Restante a Pagar</span>
                        <PriceDisplay price={order.remaining} className="text-red-500" />
                     </div>
                  </div>
               </div>

               <Separator />

               <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Detalles del Pago</h3>

                  <PaymentForm
                     orderId={order._id}
                     remainingAmount={order.remaining}
                     onSuccess={() => {
                        toast.success("Pago registrado correctamente");
                        queryClient.invalidateQueries({ queryKey: ["order-details", id] });
                        queryClient.invalidateQueries({ queryKey: ["client-orders"] });
                        // Navigate back to details page after successful payment
                        setTimeout(() => {
                           navigate(`/client/pedidos/${order._id}`);
                        }, 1500);
                     }}
                  />
               </div>

            </div>
         </main>
      </div>
   );
};
