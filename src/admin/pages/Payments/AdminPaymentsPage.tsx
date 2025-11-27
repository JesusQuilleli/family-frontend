// Force git update
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getPaymentsByAdmin, getPaymentsStats } from '@/admin/actions/payments/get-payments';
import { deletePayment } from '@/admin/actions/payments/delete-payment';
import { verifyPayment, rejectPayment } from '@/admin/actions/payments/update-payment';
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
import { MoreHorizontal, Check, X, Filter, DollarSign, CreditCard, Calendar, User, Image as ImageIcon, Trash2 } from 'lucide-react';
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
import { useState } from 'react';
import { toast } from 'sonner';
import type { Payment } from '@/interfaces/payments.interface';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { getImageUrl } from '@/helpers/get-image-url';

export const AdminPaymentsPage = () => {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const { data: statsData } = useQuery({
    queryKey: ['admin-payments-stats'],
    queryFn: getPaymentsStats,
  });

  const { data: paymentsData, isLoading, isError } = useQuery({
    queryKey: ['admin-payments', page, filterVerified, filterMethod, filterDate],
    queryFn: () => getPaymentsByAdmin({
      page,
      limit: 10,
      verified: filterVerified === 'all' ? undefined : filterVerified,
      payment_method: filterMethod === 'all' ? undefined : filterMethod,
      date: filterDate || undefined
    }),
    placeholderData: keepPreviousData,
  });


  const handleFilterVerifiedChange = (value: string) => {
    setFilterVerified(value);
    setPage(1);
  };

  const handleFilterMethodChange = (value: string) => {
    setFilterMethod(value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterVerified("all");
    setFilterMethod("all");
    setFilterDate("");
    setPage(1);
  };

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      toast.success('Pago verificado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments-stats'] });
      setDetailsDialogOpen(false); // Close details if open
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => rejectPayment(id, reason),
    onSuccess: () => {
      toast.success('Pago rechazado correctamente');
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedPayment(null);
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments-stats'] });
      setDetailsDialogOpen(false); // Close details if open
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      toast.success('Pago eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleDeleteClick = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleRejectClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedPayment && rejectReason) {
      rejectMutation.mutate({ id: selectedPayment._id, reason: rejectReason });
    }
  };

  const handleImageClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setImageDialogOpen(true);
  };

  const handleDetailsClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const renderActions = (payment: Payment) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(payment._id)}
        >
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleDetailsClick(payment)}>
          <CreditCard className="mr-2 h-4 w-4" /> Ver Detalles
        </DropdownMenuItem>

        {payment.image_checking && (
          <DropdownMenuItem onClick={() => handleImageClick(payment)}>
            <ImageIcon className="mr-2 h-4 w-4" /> Ver Comprobante
          </DropdownMenuItem>
        )}

        {!payment.verified && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => verifyMutation.mutate(payment._id)}>
              <Check className="mr-2 h-4 w-4" /> Verificar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRejectClick(payment)}>
              <X className="mr-2 h-4 w-4" /> Rechazar
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => handleDeleteClick(payment._id)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderStatusBadge = (verified: boolean) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
      ${verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
      {verified ? 'Verificado' : 'Pendiente'}
    </span>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
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
        <h2 className="text-2xl font-bold text-destructive">Error al cargar pagos</h2>
        <p className="text-muted-foreground">No se pudieron cargar los pagos. Intenta nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalPayments || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Verificado</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <PriceDisplay price={statsData?.verifiedAmount || 0} className="items-start" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Pendiente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              <PriceDisplay price={statsData?.pendingAmount || 0} className="items-start" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
          <div className="text-sm text-muted-foreground">
            Total: {paymentsData?.pagination.totalPayments || 0} registros
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>

          <Select value={filterVerified} onValueChange={handleFilterVerifiedChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Verificado</SelectItem>
              <SelectItem value="false">Pendiente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMethod} onValueChange={handleFilterMethodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="transferencia">Transferencia</SelectItem>
              <SelectItem value="efectivo">Efectivo</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
            className="w-[160px]"
          />

          {(filterVerified !== "all" || filterMethod !== "all" || filterDate) && (
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
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Ref</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData?.payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell className="font-mono text-xs">{payment._id.slice(-6)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {payment.order_uid?._id ? payment.order_uid._id.slice(-6) : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{payment.order_uid?.client_uid?.name || 'Desconocido'}</span>
                    <span className="text-xs text-muted-foreground">{payment.order_uid?.client_uid?.email}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-bold">
                  <PriceDisplay price={payment.amount} className="items-start" />
                </TableCell>
                <TableCell className="capitalize">{payment.payment_method}</TableCell>
                <TableCell className="font-mono text-xs">{payment.reference || '-'}</TableCell>
                <TableCell>
                  {renderStatusBadge(payment.verified)}
                </TableCell>
                <TableCell className="text-right">
                  {renderActions(payment)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {paymentsData?.payments.map((payment) => (
          <Card key={payment._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pago #{payment._id.slice(-6)}
              </CardTitle>
              {renderActions(payment)}
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    Cliente
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{payment.order_uid?.client_uid?.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha
                  </div>
                  <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Monto
                  </div>
                  <div className="font-bold">
                    <PriceDisplay price={payment.amount} className="items-end" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Estado</span>
                  {renderStatusBadge(payment.verified)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {paymentsData?.payments.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No se encontraron pagos</h3>
          <p className="text-muted-foreground mt-2">
            {(filterVerified !== "all" || filterMethod !== "all" || filterDate)
              ? "Intenta cambiar los filtros para ver más resultados."
              : "No hay pagos registrados."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {paymentsData && paymentsData.pagination.totalPages > 1 && (
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

              {Array.from({ length: paymentsData.pagination.totalPages }).map((_, i) => (
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
                  onClick={() => setPage(p => Math.min(paymentsData.pagination.totalPages, p + 1))}
                  disabled={page === paymentsData.pagination.totalPages}
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
            <DialogTitle>Rechazar Pago</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo del rechazo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Comprobante ilegible, monto incorrecto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason}>Rechazar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedPayment?.image_checking ? (
              <img
                src={getImageUrl(selectedPayment.image_checking)}
                alt="Comprobante"
                className="max-h-[80vh] object-contain"
                onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
              />
            ) : (
              <p>No hay imagen disponible</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pago</DialogTitle>
            <DialogDescription>
              Información completa del pago y comprobante.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-6 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información del Pago</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">

                      <span className="text-muted-foreground">Monto:</span>
                      <span className="font-bold">
                        <PriceDisplay price={selectedPayment.amount} className="items-start" />
                      </span>

                      <span className="text-muted-foreground">Método:</span>
                      <span className="capitalize">{selectedPayment.payment_method}</span>

                      <span className="text-muted-foreground">Referencia:</span>
                      <span className="font-mono">{selectedPayment.reference || 'N/A'}</span>

                      <span className="text-muted-foreground">Fecha:</span>
                      <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>

                      <span className="text-muted-foreground">Estado:</span>
                      <span>{renderStatusBadge(selectedPayment.verified)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Información del Cliente</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Nombre:</span>
                      <span>{selectedPayment.order_uid?.client_uid?.name}</span>

                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedPayment.order_uid?.client_uid?.email}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Información del Pedido</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">ID Pedido:</span>
                      <span className="font-mono">{selectedPayment.order_uid?._id}</span>

                      <span className="text-muted-foreground">Total Pedido:</span>
                      <span>
                        <PriceDisplay price={selectedPayment.order_uid?.total || 0} className="items-start" />
                      </span>

                      <span className="text-muted-foreground">Restante:</span>
                      <span>
                        <PriceDisplay price={selectedPayment.order_uid?.remaining || 0} className="items-start" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Comprobante</h4>
                  <div className="border rounded-lg p-2 bg-muted/10 flex items-center justify-center min-h-[200px]">
                    {selectedPayment.image_checking ? (
                      <img
                        src={getImageUrl(selectedPayment.image_checking)}
                        alt="Comprobante"
                        className="max-w-full max-h-[400px] object-contain rounded-md cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(getImageUrl(selectedPayment.image_checking), '_blank')}
                        title="Clic para abrir en nueva pestaña"
                        onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
                      />
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 opacity-50" />
                        <span>No hay imagen disponible</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!selectedPayment.verified && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleRejectClick(selectedPayment);
                    }}
                  >
                    Rechazar
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => verifyMutation.mutate(selectedPayment._id)}
                  >
                    Verificar Pago
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
