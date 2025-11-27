import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrdersAction } from '@/client/actions/orders/get-orders';
import { OrderCard } from '@/client/components/orders/OrderCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const ClientOrdersPage = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['client-orders', page, filterStatus, filterDate],
    queryFn: () => getOrdersAction({ page, limit: 9, status: filterStatus, date: filterDate }),
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
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error al cargar pedidos</h2>
          <p className="text-muted-foreground">No se pudieron cargar tus pedidos. Intenta nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mis Pedidos</h1>
                <p className="text-sm text-muted-foreground">
                  Historial de tus compras realizadas
                </p>
              </div>
            </div>

            {/* Filters */}
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

              {(filterStatus !== "all" || filterDate) && (
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
        </div>
      </header>

      {/* Orders Grid */}
      <main className="container mx-auto px-4 py-8">
        {!ordersData?.orders || ordersData.orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No se encontraron pedidos</h3>
            <p className="text-muted-foreground mt-2">
              {(filterStatus !== "all" || filterDate)
                ? "Intenta cambiar los filtros para ver más resultados."
                : "Tus pedidos realizados aparecerán aquí."}
            </p>
            {(filterStatus !== "all" || filterDate) && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-sm text-muted-foreground">
                Mostrando {ordersData.orders.length} pedido{ordersData.orders.length !== 1 ? 's' : ''} de {ordersData.totalOrders}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {ordersData.orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {ordersData.totalPages > 1 && (
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
            )}
          </>
        )}
      </main>
    </div>
  );
};
