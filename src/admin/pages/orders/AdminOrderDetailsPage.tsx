import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, User, Calendar, CreditCard, DollarSign, Check, BadgeCheck, AlertTriangle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { ImageWithLoader } from '@/components/common/ImageWithLoader';
import { getImageUrl } from '@/helpers/get-image-url';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/admin-products/LoadingSpinner';
import { toast } from 'sonner';
import { FamilyApi } from "@/api/family.api";
import { approveOrder, rejectOrder } from '@/admin/actions/orders/update-order';
// Payment actions are defined inline for now, so imports removed to avoid errors if files are missing.
// import { getPaymentsByOrder } from '@/admin/actions/payments/get-payments-by-order'; 
// import { verifyPayment, rejectPayment } from '@/admin/actions/payments/update-payment';
// Temporary mocked actions until files confirmed
// Imports fixed

// Create ad-hoc fetch functions here if they don't exist yet to safe time, or better create them properly.
// I will create inline fetchers for now to ensure page works, then refactor.

const getAdminOrderById = async (id: string) => {
   const { data } = await FamilyApi.get(`/orders/${id}`);
   return data.order;
}

const getOrderPayments = async (id: string) => {
   const { data } = await FamilyApi.get(`/payments/order/${id}`);
   return data.payments;
}

export const AdminOrderDetailsPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   const { data: order, isLoading: isLoadingOrder } = useQuery({
      queryKey: ['admin-order', id],
      queryFn: () => getAdminOrderById(id!),
      enabled: !!id
   });

   const { data: payments, isLoading: isLoadingPayments } = useQuery({
      queryKey: ['admin-order-payments', id],
      queryFn: () => getOrderPayments(id!),
      enabled: !!id
   });

   const approveMutation = useMutation({
      mutationFn: approveOrder,
      onSuccess: () => {
         toast.success('Pedido aprobado correctamente');
         queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      },
      onError: (err: any) => toast.error(err.message)
   });

   const rejectOrderMutation = useMutation({
      mutationFn: ({ id, reason }: { id: string, reason: string }) => rejectOrder(id, reason),
      onSuccess: () => {
         toast.success('Pedido rechazado');
         queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
         navigate('/admin/pedidos');
      },
      onError: (err: any) => toast.error(err.message)
   });

   // Payment verification actions
   const verifyPaymentMutation = useMutation({
      mutationFn: async (paymentId: string) => {
         const { data } = await FamilyApi.put(`/payments/${paymentId}/verify`);
         return data;
      },
      onSuccess: () => {
         toast.success('Pago verificado');
         queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
         queryClient.invalidateQueries({ queryKey: ['admin-order-payments', id] });
      },
      onError: (err: any) => toast.error(err.response?.data?.msg || err.message)
   });

   const rejectPaymentMutation = useMutation({
      mutationFn: async ({ paymentId, reason }: { paymentId: string, reason: string }) => {
         const { data } = await FamilyApi.put(`/payments/${paymentId}/reject`, { reason });
         return data;
      },
      onSuccess: () => {
         toast.success('Pago rechazado');
         queryClient.invalidateQueries({ queryKey: ['admin-order-payments', id] });
      },
      onError: (err: any) => toast.error(err.response?.data?.msg || err.message)
   });


   if (isLoadingOrder || isLoadingPayments) return <LoadingSpinner title="Cargando detalles del pedido..." />;
   if (!order) return <div className="p-8">Pedido no encontrado</div>;

   const renderStatusBadge = (status: string) => (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize border 
         ${status === 'pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
            status === 'pagado' ? 'bg-green-50 text-green-700 border-green-200' :
               status === 'cancelado' ? 'bg-red-50 text-red-700 border-red-200' :
                  status === 'rechazado' ? 'bg-red-50 text-red-700 border-red-200' :
                     'bg-gray-50 text-gray-700 border-gray-200'} `}>
         {status}
      </div>
   );

   return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
         {/* Navigation */}
         <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate('/admin/pedidos')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Pedidos
         </Button>

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">Pedido #{order._id.slice(-6)}</h1>
                  {renderStatusBadge(order.status)}
               </div>
               <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  <span className="mx-1">•</span>
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
               </p>
            </div>

            {/* Main Actions */}
            <div className="flex gap-2">
               {order.status === 'pendiente' && (
                  <>
                     <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => {
                        const reason = prompt("Motivo del rechazo:");
                        if (reason) rejectOrderMutation.mutate({ id: order._id, reason });
                     }}>
                        <Ban className="mr-2 h-4 w-4" /> Rechazar
                     </Button>
                     <Button onClick={() => approveMutation.mutate(order._id)}>
                        <Check className="mr-2 h-4 w-4" /> Aprobar Pedido
                     </Button>
                  </>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Products & Payments */}
            <div className="lg:col-span-2 space-y-6">

               {/* Client Info Card */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" /> Información del Cliente
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                     <div>
                        <p className="text-muted-foreground">Nombre</p>
                        <p className="font-medium">{order.client_uid?.name}</p>
                     </div>
                     <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{order.client_uid?.email}</p>
                     </div>
                     <div>
                        <p className="text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{order.client_uid?.phone || 'No registrado'}</p>
                     </div>
                  </CardContent>
               </Card>

               {/* Products List */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="h-4 w-4" /> Productos ({order.products.length})
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {order.products.map((item: any) => (
                        <div key={item._id} className="flex items-start gap-4 py-4 border-b last:border-0 last:pb-0">
                           <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                              {item.product_uid?.image ? (
                                 <ImageWithLoader
                                    src={getImageUrl(item.product_uid.image)}
                                    alt={item.product_uid.name}
                                    className="h-full w-full object-cover"
                                 />
                              ) : (
                                 <Package className="h-8 w-8 text-muted-foreground" />
                              )}
                           </div>
                           <div className="flex-1 min-w-0 hidden sm:block">
                              <h4 className="font-medium text-sm sm:text-base truncate">{item.product_uid?.name || 'Producto eliminado'}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                 <span>Cant: {item.stock}</span>
                                 <span>x <PriceDisplay price={item.sale_price} /></span>
                              </div>
                           </div>

                           {/* Mobile View */}
                           <div className="flex-1 min-w-0 sm:hidden">
                              <h4 className="font-medium text-sm truncate">{item.product_uid?.name || 'Producto eliminado'}</h4>
                              <div className="flex flex-col gap-1 mt-1">
                                 <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Cant: {item.stock}</span>
                                    <span>x <PriceDisplay price={item.sale_price} /></span>
                                 </div>
                                 <div className="font-bold text-sm">
                                    Total: <PriceDisplay price={item.sale_price * item.stock} />
                                 </div>
                              </div>
                           </div>

                           <div className="font-bold whitespace-nowrap hidden sm:block">
                              <PriceDisplay price={item.sale_price * item.stock} />
                           </div>
                        </div>
                     ))}

                     <div className="flex justify-end pt-4">
                        <div className="w-full sm:w-1/2 space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <PriceDisplay price={order.total} />
                           </div>
                           <Separator />
                           <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <PriceDisplay price={order.total} />
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Payments List */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-4 w-4" /> Pagos Registrados
                     </CardTitle>
                     <CardDescription>
                        Historial de pagos y comprobantes subidos por el cliente.
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {payments && payments.length > 0 ? (
                        payments.map((payment: any) => (
                           <div key={payment._id} className="bg-muted/30 rounded-lg p-4 border space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <Badge variant={payment.verified ? 'default' : 'secondary'} className={payment.verified ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                                          {payment.verified ? "Verificado" : "Pendiente de Revisión"}
                                       </Badge>
                                       <span className="text-xs text-muted-foreground">
                                          {new Date(payment.createdAt).toLocaleDateString()}
                                       </span>
                                    </div>
                                    <div className="mt-1 font-semibold text-lg flex items-center gap-2">
                                       <PriceDisplay price={payment.amount} />
                                       <span className="text-sm font-normal text-muted-foreground capitalize">
                                          via {payment.payment_method}
                                       </span>
                                    </div>
                                    {payment.reference && (
                                       <p className="text-xs text-muted-foreground mt-1">Ref: {payment.reference}</p>
                                    )}
                                 </div>

                                 {/* Verification Actions */}
                                 {!payment.verified && (
                                    <div className="flex gap-2">
                                       <Button size="sm" variant="outline" className="text-destructive h-8" onClick={() => {
                                          const reason = prompt("Motivo del rechazo:");
                                          if (reason) rejectPaymentMutation.mutate({ paymentId: payment._id, reason });
                                       }}>
                                          Rechazar
                                       </Button>
                                       <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => verifyPaymentMutation.mutate(payment._id)}>
                                          <BadgeCheck className="w-4 h-4 mr-1" />
                                          Verificar Pago
                                       </Button>
                                    </div>
                                 )}
                              </div>

                              {/* Proof Image */}
                              {payment.image_checking && (
                                 <div className="rounded-md overflow-hidden border max-w-sm">
                                    <ImageWithLoader
                                       src={getImageUrl(payment.image_checking)}
                                       alt="Comprobante"
                                       className="w-full h-auto object-contain max-h-[300px]"
                                    />
                                    <div className="p-2 bg-muted text-center">
                                       <a href={getImageUrl(payment.image_checking)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                          Ver imagen completa
                                       </a>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ))
                     ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">No hay pagos registrados aún.</p>
                     )}
                  </CardContent>
               </Card>
            </div>

            {/* Right Column: Financial Overview */}
            <div className="space-y-6">
               <Card>
                  <CardHeader>
                     <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Resumen Financiero
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Total Pedido</span>
                        <span className="font-semibold"><PriceDisplay price={order.total} /></span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-sm text-green-700">Pagado</span>
                        <span className="font-semibold text-green-700"><PriceDisplay price={order.subscriber || 0} /></span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-sm text-red-700">Restante</span>
                        <span className="font-bold text-red-700 text-lg"><PriceDisplay price={order.remaining || 0} /></span>
                     </div>

                     {order.status === 'por pagar' && order.remaining > 0 && payments?.some((p: any) => !p.verified) && (
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-100 flex items-start gap-2">
                           <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                           <span>Hay pagos pendientes de verificación. Revísalos y verifícalos para actualizar el saldo restante.</span>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}
