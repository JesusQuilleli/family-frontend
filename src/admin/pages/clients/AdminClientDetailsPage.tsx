import { useParams } from "react-router-dom";
import { useAdminUser } from "@/hooks/useAdminUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getOrdersByAdmin } from "@/actions/order-actions";
import { getAllPaymentsByAdmin } from "@/actions/payment-actions";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/admin-products/LoadingSpinner";

export const AdminClientDetailsPage = () => {
   const { id } = useParams<{ id: string }>();
   const { user, isLoading: isLoadingUser } = useAdminUser(id || "");

   const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
      queryKey: ['orders', 'admin', id],
      queryFn: () => getOrdersByAdmin(1, 50, '', '', '', id),
      enabled: !!id
   });

   const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
      queryKey: ['payments', 'admin', id],
      queryFn: () => getAllPaymentsByAdmin(1, 50, '', '', id),
      enabled: !!id
   });

   if (isLoadingUser) return <LoadingSpinner title="Cargando Informacion del Cliente" />;
   if (!user) return <div className="p-8 text-center">Cliente no encontrado</div>;

   return (
      <div className="container mx-auto p-6 space-y-6">
         <h1 className="text-3xl font-bold">Detalles del Cliente</h1>

         <Card>
            <CardHeader>
               <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <span className="font-semibold">Nombre:</span> {user.name}
               </div>
               <div>
                  <span className="font-semibold">Email:</span> {user.email}
               </div>
               <div>
                  <span className="font-semibold">Teléfono:</span> {user.phone || "N/A"}
               </div>
            </CardContent>
         </Card>

         <Tabs defaultValue="orders" className="w-full">
            <TabsList>
               <TabsTrigger value="orders">Pedidos</TabsTrigger>
               <TabsTrigger value="payments">Pagos</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
               <Card>
                  <CardHeader>
                     <CardTitle>Historial de Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {isLoadingOrders ? (
                        <div className="text-center py-4">Cargando pedidos...</div>
                     ) : (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>ID</TableHead>
                                 <TableHead>Fecha</TableHead>
                                 <TableHead>Total</TableHead>
                                 <TableHead>Estado</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {ordersData?.orders.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-center">No hay pedidos registrados</TableCell>
                                 </TableRow>
                              ) : (
                                 ordersData?.orders.map((order) => (
                                    <TableRow key={order._id}>
                                       <TableCell className="font-mono text-xs">{order._id.slice(-6)}</TableCell>
                                       <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                       <TableCell>${order.total.toFixed(2)}</TableCell>
                                       <TableCell>
                                          <Badge variant={order.status === 'pagado' ? 'default' : 'secondary'}>
                                             {order.status}
                                          </Badge>
                                       </TableCell>
                                    </TableRow>
                                 ))
                              )}
                           </TableBody>
                        </Table>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="payments">
               <Card>
                  <CardHeader>
                     <CardTitle>Historial de Pagos</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {isLoadingPayments ? (
                        <div className="text-center py-4">Cargando pagos...</div>
                     ) : (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Pedido</TableHead>
                                 <TableHead>Monto</TableHead>
                                 <TableHead>Método</TableHead>
                                 <TableHead>Referencia</TableHead>
                                 <TableHead>Estado</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {paymentsData?.payments.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-center">No hay pagos registrados</TableCell>
                                 </TableRow>
                              ) : (
                                 paymentsData?.payments.map((payment) => (
                                    <TableRow key={payment._id}>
                                       <TableCell className="font-mono text-xs">
                                          {payment.order_uid?._id ? `#${payment.order_uid._id.slice(-6)}` : 'N/A'}
                                       </TableCell>
                                       <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                       <TableCell className="capitalize">{payment.payment_method}</TableCell>
                                       <TableCell>{payment.reference || "N/A"}</TableCell>
                                       <TableCell>
                                          <Badge variant={payment.verified ? 'default' : 'secondary'}>
                                             {payment.verified ? "Verificado" : "Pendiente"}
                                          </Badge>
                                       </TableCell>
                                    </TableRow>
                                 ))
                              )}
                           </TableBody>
                        </Table>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>
      </div>
   );
};
