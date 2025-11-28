import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getClientPaymentsAction } from '@/client/actions/payments/get-client-payments';
import { getClientPaymentsStatsAction } from '@/client/actions/payments/get-client-stats';
import { deletePaymentAction } from '@/client/actions/payments/delete-payment';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { CreditCard, Filter, X, Trash2, Image as ImageIcon, Calendar, Package, Hash } from 'lucide-react';
import { toast } from 'sonner';
import type { Payment } from '@/interfaces/payments.interface';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getImageUrl } from '@/helpers/get-image-url';

export const ClientPaymentsPage = () => {

  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [page, setPage] = useState(1);
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const { data: statsData } = useQuery({
    queryKey: ['client-payments-stats'],
    queryFn: getClientPaymentsStatsAction,
  });

  const { data: paymentsData, isLoading, isError } = useQuery({
    queryKey: ['client-payments', page, filterVerified, filterMethod, filterDate],
    queryFn: () => getClientPaymentsAction({
      page,
      limit: 10,
      verified: filterVerified === 'all' ? undefined : filterVerified,
      payment_method: filterMethod === 'all' ? undefined : filterMethod,
      date: filterDate || undefined
    }),
    placeholderData: keepPreviousData,
  });


  const deleteMutation = useMutation({
    mutationFn: deletePaymentAction,
    onSuccess: () => {
      toast.success('Pago eliminado correctamente');
      setDeleteDialogOpen(false);
      setSelectedPayment(null);
      queryClient.invalidateQueries({ queryKey: ['client-payments'] });
      queryClient.invalidateQueries({ queryKey: ['client-payments-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
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

  const handleImageClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setImageDialogOpen(true);
  };

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPayment) {
      deleteMutation.mutate(selectedPayment._id);
    }
  };

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
        <p className="text-muted-foreground">No se pudieron cargar tus pagos. Intenta nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-1 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos Realizados</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalPayments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mis Pagos</h1>
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

      {/* Payments List */}
      <div className="space-y-4">
        {paymentsData?.payments.map((payment) => (
          <Card key={payment._id}>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Payment Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Receipt Thumbnail */}
                  <div className="flex-shrink-0">
                    {payment.image_checking ? (
                      <div
                        onClick={() => handleImageClick(payment)}
                        className="relative group cursor-pointer"
                      >
                        <img
                          src={getImageUrl(payment.image_checking)}
                          alt="Comprobante"
                          className="w-16 h-16 rounded-md object-cover bg-muted border"
                          onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center border">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg" title={payment._id}>
                        {payment.order_uid
                          ? `Pago destinado al Pedido #${payment.order_uid._id.slice(-6)}`
                          : `Pago #${payment._id.slice(-6)}`
                        }
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(payment.createdAt), "PPP", { locale: es })}</span>
                      </div>
                      {payment.reference && (
                        <div className="flex items-center gap-1">
                          <span className="font-mono bg-muted/50 px-2 py-0.5 rounded">
                            Ref: {payment.reference}
                          </span>
                        </div>
                      )}
                      {payment.order_uid && (
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span>Pedido: #{payment.order_uid._id.slice(-6)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="flex flex-col items-end gap-2">
                  <PriceDisplay price={payment.amount} className="items-end" />
                  {renderStatusBadge(payment.verified)}

                  {!payment.verified && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(payment)}
                      className="mt-2"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {
        paymentsData?.payments.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No se encontraron pagos</h3>
            <p className="text-muted-foreground mt-2">
              {(filterVerified !== "all" || filterMethod !== "all" || filterDate)
                ? "Intenta cambiar los filtros para ver más resultados."
                : "Tus pagos registrados aparecerán aquí."}
            </p>
          </div>
        )
      }

      {/* Pagination */}
      {
        paymentsData && paymentsData.pagination.totalPages > 1 && (
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
        )
      }

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          {selectedPayment?.image_checking && (
            <img
              src={getImageUrl(selectedPayment.image_checking)}
              alt="Comprobante completo"
              className="w-full h-auto rounded-lg"
              onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Pago</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};
