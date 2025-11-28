import { Header } from "@/components/custom/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, CreditCard, Package, PlusCircle } from "lucide-react";
import { ReferralLinkCard } from "@/admin/components/referral/ReferralLinkCard";
import { Link } from "react-router-dom";
import { useAdminDashboard } from "@/admin/hooks/useAdminDashboard";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { LoadingSpinner } from "@/components/admin-products/LoadingSpinner";
import { getImageUrl } from "@/helpers/get-image-url";

export const HomePageAdmin = () => {
  const { stats, recentOrders, topProducts, isLoading } = useAdminDashboard();

  const statCards = [
    {
      title: "Ventas Totales",
      value: <PriceDisplay price={stats.totalSales} className="text-2xl font-bold" />,
      change: "Global",
      icon: DollarSign,
      description: "Ingresos históricos"
    },
    {
      title: "Pedidos Recientes",
      value: stats.pendingOrders.toString(),
      change: "Últimos 5",
      icon: ShoppingBag,
      description: "Mostrados en actividad"
    },
    {
      title: "Pagos por Verificar",
      value: stats.pendingPayments.toString(),
      change: "Pendientes",
      icon: CreditCard,
      description: "Requieren aprobación"
    },
    {
      title: "Clientes Registrados",
      value: stats.activeClients.toString(),
      change: "Total",
      icon: Users,
      description: "Usuarios en plataforma"
    },
  ];

  const quickActions = [
    { title: "Verificar Pagos", icon: CreditCard, href: "/admin/pagos", color: "bg-blue-100 text-blue-600" },
    { title: "Gestionar Pedidos", icon: Package, href: "/admin/pedidos", color: "bg-orange-100 text-orange-600" },
    { title: "Agregar Producto", icon: PlusCircle, href: "/admin/productos", color: "bg-green-100 text-green-600" },
  ];

  if (isLoading) {
    return <LoadingSpinner title="Cargando panel de control..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <Header title="Panel de Control" subtitle="Resumen general de tu tienda y actividades recientes." />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} • {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area - 2 Columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Accesos directos a las tareas más comunes</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.href}>
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer h-full text-center space-y-2">
                    <div className={`p-2 rounded-full ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{action.title}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity / Orders Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimos pedidos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4 sm:gap-0">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">Pedido #{order._id.slice(-6)}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.client_uid?.name || 'Cliente'} • {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium pl-[3.25rem] sm:pl-0">
                        <PriceDisplay price={order.total} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area - 1 Column */}
        <div className="space-y-6">
          <ReferralLinkCard />

          <Card>
            <CardHeader>
              <CardTitle>Productos Agregados a la Tienda Recientemente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay productos disponibles.</p>
                ) : (
                  topProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                        {product.image && (
                          <img src={getImageUrl(product.image)} alt={product.name} className="h-8 w-8 rounded object-cover shrink-0" onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }} />
                        )}
                        <span className="text-sm truncate">{product.name}</span>
                      </div>
                      <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full shrink-0">
                        <PriceDisplay price={product.sale_price} />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
