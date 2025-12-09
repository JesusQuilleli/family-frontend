import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getOrdersByAdmin } from '@/admin/actions/orders/get-orders';

import { approveOrder, rejectOrder, cancelOrder } from '@/admin/actions/orders/update-order';
import { mergeOrders } from '@/admin/actions/orders/merge-orders';
import { sendPaymentReminder, sendBulkPaymentReminders } from '@/actions/order-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
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
import { MoreHorizontal, Check, X, Ban, RefreshCw, Calendar, User, DollarSign, Filter, Package, Eye, CreditCard, Bell, Merge } from 'lucide-react';
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
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

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



  const reminderMutation = useMutation({
    mutationFn: sendPaymentReminder,
    onSuccess: () => {
      toast.success('Recordatorio enviado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || 'Error al enviar recordatorio');
    }
  });

  const bulkReminderMutation = useMutation({
    mutationFn: sendBulkPaymentReminders,
    onSuccess: (data: any) => {
      toast.success(data.msg || 'Recordatorios enviados correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || 'Error al enviar recordatorios masivos');
    }
  });

  const mergeMutation = useMutation({
    mutationFn: mergeOrders,
    onSuccess: () => {
      toast.success('Pedidos unificados correctamente');
      setMergeDialogOpen(false);
      setSelectedOrders(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const toggleAllSelection = () => {
    if (!ordersData) return;

    // Solo permitir seleccionar pendientes
    const pendingOrders = ordersData.orders.filter(o => o.status === 'pendiente');

    if (selectedOrders.size === pendingOrders.length && pendingOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      const newSelection = new Set<string>();
      pendingOrders.forEach(o => newSelection.add(o._id));
      setSelectedOrders(newSelection);
    }
  };

  const selectedOrdersList = ordersData?.orders.filter(o => selectedOrders.has(o._id)) || [];

  // Validaciones para merge
  const canMerge = () => {
    if (selectedOrders.size < 2) return false;

    // Verificar mismo cliente
    const firstClient = selectedOrdersList[0]?.client_uid?._id;
    if (!firstClient) return false; // Should not happen

    return selectedOrdersList.every(o => o.client_uid?._id === firstClient);
  };

  const handleMergeClick = () => {
    if (canMerge()) {
      setMergeDialogOpen(true);
    } else {
      toast.error("Selecciona al menos 2 pedidos del mismo cliente para unificar.");
    }
  };

  const handleConfirmMerge = () => {
    mergeMutation.mutate(Array.from(selectedOrders));
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

        {(order.status === 'por pagar' || order.status === 'abonado') && (
          <DropdownMenuItem onClick={() => reminderMutation.mutate(order._id)}>
            <Bell className="mr-2 h-4 w-4" /> Enviar Cobro
          </DropdownMenuItem>
        )}

        {/* WhatsApp Button */}
        {(order.status === 'pendiente' || order.status === 'por pagar' || order.status === 'abonado') && order.client_uid?.phone && (
          <DropdownMenuItem onClick={() => {
            const phone = (order.client_uid?.phone || '').replace(/\D/g, '');
            const message = `Hola ${order.client_uid?.name || 'Cliente'}, te recordamos que tienes el pedido #${order._id.slice(-6)} pendiente por pagar. Monto pendiente: ${order.remaining > 0 ? order.remaining : order.total}. Por favor reporta tu pago ingresando a https://familyapp.shop-mg.com/.`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
          }}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </DropdownMenuItem>
        )}




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

  const showRemainingColumn = ordersData?.orders.some(order => order.status !== 'pagado');

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



          <Button
            variant="outline"
            size="sm"
            onClick={() => bulkReminderMutation.mutate()}
            disabled={bulkReminderMutation.isPending}
            className="ml-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            {bulkReminderMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Enviar Cobro General
              </>
            )}
          </Button>
        </div>

        {selectedOrders.size > 0 && (
          <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium px-2">{selectedOrders.size} seleccionados</span>
            <Button
              size="sm"
              variant="default"
              onClick={handleMergeClick}
              disabled={!canMerge()}
            >
              <Merge className="w-4 h-4 mr-2" />
              Unificar Pedidos
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedOrders(new Set())}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    ordersData?.orders.some(o => o.status === 'pendiente') &&
                    selectedOrders.size === ordersData?.orders.filter(o => o.status === 'pendiente').length &&
                    selectedOrders.size > 0
                  }
                  onCheckedChange={toggleAllSelection}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              {showRemainingColumn && <TableHead>Restante</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersData?.orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.has(order._id)}
                    onCheckedChange={() => toggleOrderSelection(order._id)}
                    disabled={order.status !== 'pendiente'}
                    aria-label={`Select order ${order._id}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{order._id.slice(-6)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.client_uid?.name || 'Usuario Eliminado'}</span>
                    <span className="text-xs text-muted-foreground">{order.client_uid?.email || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <PriceDisplay price={order.total} className="items-start" />
                </TableCell>
                {showRemainingColumn && (
                  <TableCell>
                    {order.status !== 'pagado' && (
                      <div className={`${order.remaining > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}`}>
                        <PriceDisplay price={order.remaining} className="items-start" />
                      </div>
                    )}
                  </TableCell>
                )}
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
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOrders.has(order._id)}
                  onCheckedChange={() => toggleOrderSelection(order._id)}
                  disabled={order.status !== 'pendiente'}
                  aria-label={`Select order ${order._id}`}
                />
                <CardTitle className="text-sm font-medium">
                  Pedido #{order._id.slice(-6)}
                </CardTitle>
              </div>
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
                    <div className="font-medium">{order.client_uid?.name || 'Usuario Eliminado'}</div>
                    <div className="text-xs text-muted-foreground">{order.client_uid?.email || 'N/A'}</div>
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
                {order.status !== 'pagado' && (
                  <div className="flex items-start justify-between text-sm">
                    <div className="flex items-center text-muted-foreground mt-1">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Restante
                    </div>
                    <div className={`font-bold text-right ${order.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      <PriceDisplay price={order.remaining} className="items-end" />
                    </div>
                  </div>
                )}
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

      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unificar Pedidos</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas unificar los {selectedOrders.size} pedidos seleccionados?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-md border border-yellow-200">
              <p className="font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" /> Importante
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Los pedidos originales serán eliminados permanentemente.</li>
                <li>El stock se recalculará automáticamente.</li>
                <li>Se creará un nuevo pedido con la suma de los productos.</li>
              </ul>
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              <strong>Pedidos a unificar:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedOrdersList.map(o => (
                  <span key={o._id} className="bg-muted px-2 py-1 rounded-md text-xs font-mono">
                    #{o._id.slice(-6)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 font-medium">
              <span>Nuevo Total Estimado:</span>
              <PriceDisplay price={selectedOrdersList.reduce((acc, o) => acc + o.total, 0)} className="text-lg" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmMerge}>Confirmar Unificación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{selectedOrder?._id.slice(-6)}</DialogTitle>
            <DialogDescription>
              Cliente: {selectedOrder?.client_uid?.name || 'Usuario Eliminado'} ({selectedOrder?.client_uid?.email || 'N/A'})
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder?.products.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product_uid?.image ? getImageUrl(item.product_uid.image) : '/not-image.jpg'}
                            alt={item.product_uid?.name || 'Producto eliminado'}
                            className="w-10 h-10 rounded-md object-cover"
                            onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
                          />
                          <span className="font-medium">{item.product_uid?.name || 'Producto eliminado'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceDisplay price={item.sale_price} />
                      </TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
              {selectedOrder?.products.map((item) => (
                <div key={item._id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <img
                    src={item.product_uid?.image ? getImageUrl(item.product_uid.image) : '/not-image.jpg'}
                    alt={item.product_uid?.name || 'Producto eliminado'}
                    className="w-16 h-16 rounded-md object-cover shrink-0"
                    onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product_uid?.name || 'Producto eliminado'}</p>
                    <div className="flex justify-between mt-2 text-sm">
                      <div className="text-muted-foreground">
                        {item.stock} x <PriceDisplay price={item.sale_price} />
                      </div>
                      <div className="font-medium">
                        <PriceDisplay price={item.sale_price * item.stock} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
    </div >
  );
};
