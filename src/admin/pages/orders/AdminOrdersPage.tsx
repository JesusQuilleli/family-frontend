import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getOrdersByAdmin } from '@/admin/actions/orders/get-orders';
import { deleteOrder } from '@/admin/actions/orders/delete-order';
import { approveOrder, rejectOrder, cancelOrder, updateOrderStatus } from '@/admin/actions/orders/update-order';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Check, X, Ban, RefreshCw, Calendar, User, DollarSign, Filter, Package, Trash2, Eye, CreditCard } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Order } from '@/interfaces/orders.interface';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { getImageUrl } from '@/helpers/get-image-url';

export const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [searchId, setSearchId] = useState("");
  const [debouncedSearchId, setDebouncedSearchId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchId(searchId);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchId]);


  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', page, filterStatus, filterDate, debouncedSearchId],
    queryFn: () => getOrdersByAdmin({ page, limit: 10, status: filterStatus, date: filterDate, search: debouncedSearchId }),
    placeholderData: keepPreviousData,
  });


  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value);
    setPage(1);
  };

  const handleFilterDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterDate("");
    setSearchId("");
    setPage(1);
  };

  const approveMutation = useMutation({
    mutationFn: approveOrder,
    onSuccess: () => {
      toast.success('Pedido aprobado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => rejectOrder(id, reason),
    onSuccess: () => {
      toast.success('Pedido rechazado correctamente');
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => cancelOrder(id, reason),
    onSuccess: () => {
      toast.success('Pedido cancelado correctamente');
      setCancelDialogOpen(false);
      setCancelReason("");
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Estado actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success('Pedido eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleDeleteClick = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este pedido? Esta acción eliminará también los pagos asociados y no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleRejectClick = (order: Order) => {
    setSelectedOrder(order);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedOrder && rejectReason) {
      rejectMutation.mutate({ id: selectedOrder._id, reason: rejectReason });
    }
  };

  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedOrder && cancelReason) {
      cancelMutation.mutate({ id: selectedOrder._id, reason: cancelReason });
    }
  };

  const handleDetailsClick = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const renderActions = (order: Order) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleDetailsClick(order)}>
          <Eye className="mr-2 h-4 w-4" /> Ver Detalles
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(order._id)}
        >
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {order.status === 'pendiente' && (
          <>
            <DropdownMenuItem onClick={() => approveMutation.mutate(order._id)}>
              <Check className="mr-2 h-4 w-4" /> Aprobar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRejectClick(order)}>
              <Ban className="mr-2 h-4 w-4" /> Rechazar
            </DropdownMenuItem>
          </>
        )}

        {(order.status === 'pendiente' || order.status === 'por pagar') && (
          <DropdownMenuItem onClick={() => handleCancelClick(order)}>
            <X className="mr-2 h-4 w-4" /> Cancelar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
        {['pendiente', 'por pagar', 'abonado', 'pagado', 'completado'].map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={order.status === status}
            onClick={() => statusMutation.mutate({ id: order._id, status })}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> {status}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => handleDeleteClick(order._id)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderStatusBadge = (status: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
      ${status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
        status === 'pagado' ? 'bg-green-100 text-green-800' :
          status === 'cancelado' ? 'bg-red-100 text-red-800' :
            status === 'rechazado' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
      }`}>
      {status}
    </span>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error al cargar pedidos</h2>
        <p className="text-muted-foreground">No se pudieron cargar los pedidos. Intenta nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
          <div className="text-sm text-muted-foreground">
            Total: {ordersData?.totalOrders || 0} pedidos
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>

          <Select value={filterStatus} onValueChange={handleFilterStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="por pagar">Por Pagar</SelectItem>
              <SelectItem value="abonado">Abonado</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="rechazado">Rechazado</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filterDate}
            onChange={handleFilterDateChange}
            className="w-[160px]"
          />

          <Input
            type="text"
            placeholder="Buscar por ID..."
            value={searchId}
            onChange={(e) => { setSearchId(e.target.value); setPage(1); }}
            className="w-[200px]"
          />

          {(filterStatus !== "all" || filterDate || searchId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Restante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersData?.orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-xs">{order._id.slice(-6)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.client_uid.name}</span>
                    <span className="text-xs text-muted-foreground">{order.client_uid.email}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <PriceDisplay price={order.total} className="items-start" />
                </TableCell>
                <TableCell>
                  <div className={`${order.remaining > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}`}>
                    <PriceDisplay price={order.remaining} className="items-start" />
                  </div>
                </TableCell>
                <TableCell>
                  {renderStatusBadge(order.status)}
                </TableCell>
                <TableCell className="text-right">
                  {renderActions(order)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {ordersData?.orders.map((order) => (
          <Card key={order._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedido #{order._id.slice(-6)}
              </CardTitle>
              {renderActions(order)}
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    Cliente
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{order.client_uid.name}</div>
                    <div className="text-xs text-muted-foreground">{order.client_uid.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha
                  </div>
                  <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-start justify-between text-sm">
                  <div className="flex items-center text-muted-foreground mt-1">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Total
                  </div>
                  <div className="font-bold text-right">
                    <PriceDisplay price={order.total} className="items-end" />
                  </div>
                </div>
                <div className="flex items-start justify-between text-sm">
                  <div className="flex items-center text-muted-foreground mt-1">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Restante
                  </div>
                  <div className={`font-bold text-right ${order.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <PriceDisplay price={order.remaining} className="items-end" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Estado</span>
                  {renderStatusBadge(order.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {ordersData?.orders.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No se encontraron pedidos</h3>
          <p className="text-muted-foreground mt-2">
            {(filterStatus !== "all" || filterDate || searchId)
              ? "Intenta cambiar los filtros para ver más resultados."
              : "No hay pedidos registrados."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {ordersData && ordersData.totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1 pl-2.5"
                >
                  <PaginationPrevious className="static translate-x-0" onClick={(e) => e.preventDefault()} />
                </Button>
              </PaginationItem>

              {Array.from({ length: ordersData.totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.min(ordersData.totalPages, p + 1))}
                  disabled={page === ordersData.totalPages}
                  className="gap-1 pr-2.5"
                >
                  <PaginationNext className="static translate-x-0" onClick={(e) => e.preventDefault()} />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Pedido</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo del rechazo. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Stock insuficiente, datos incorrectos..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason}>Rechazar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Pedido</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo de la cancelación. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">Motivo</Label>
              <Input
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej: Cliente solicitó cancelación..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Volver</Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={!cancelReason}>Cancelar Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{selectedOrder?._id.slice(-6)}</DialogTitle>
            <DialogDescription>
              Cliente: {selectedOrder?.client_uid.name} ({selectedOrder?.client_uid.email})
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedOrder?.products.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.product_uid.image && (
                          <img
                            src={getImageUrl(item.product_uid.image)}
                            alt={item.product_uid.name}
                            className="w-10 h-10 rounded-md object-cover"
                            onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
                          />
                        )}
                        <span className="font-medium">{item.product_uid.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <PriceDisplay price={item.sale_price} />
                    </TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell className="text-right">
                      <PriceDisplay price={item.sale_price * item.stock} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full border-t pt-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Total:</span>
              <PriceDisplay price={selectedOrder?.total || 0} className="text-lg font-bold text-green-600" />
            </div>
            <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
