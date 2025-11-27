import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, Package, ArrowRight, UserPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/custom/Header";
import { useAuthStore } from "@/auth/store/auth.store";
import { Link } from "react-router-dom";
import { useClientDashboard } from "@/client/hooks/useClientDashboard";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { LoadingSpinner } from "@/components/admin-products/LoadingSpinner";

export const HomePageClient = () => {
  const { user } = useAuthStore();
  const { recentOrders, featuredProducts, isLoading } = useClientDashboard();

  const categories = [
    { name: "Tecnología", icon: "💻", href: "/client/productos" },
    { name: "Ropa", icon: "👕", href: "/client/productos" },
    { name: "Hogar", icon: "🏠", href: "/client/productos" },
    { name: "Deportes", icon: "⚽", href: "/client/productos" },
  ];

  if (isLoading) {
    return <LoadingSpinner title="Cargando tu experiencia de compra..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Header
        title={`¡Hola, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle={`Bienvenido a la tienda de ${user?.adminAsociado?.name || 'tu proveedor'}.`}
      />

      {/* Hero / Promo Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/60 text-primary-foreground shadow-lg">
        <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Descubre las mejores ofertas de la semana
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Productos seleccionados con hasta un 20% de descuento. ¡No te lo pierdas!
          </p>
          <Link to="/client/productos">
            <Button size="lg" variant="secondary" className="font-semibold gap-2">
              <ShoppingBag className="h-5 w-5" />
              Ir a Comprar
            </Button>
          </Link>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Categories */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Explorar Categorías</h3>
              <Link to="/client/productos" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.name} to={cat.href}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-none shadow-sm bg-secondary/20">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <span className="text-4xl">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Orders Status */}
          <Card>
            <CardHeader>
              <CardTitle>Tus Pedidos Activos</CardTitle>
              <CardDescription>Seguimiento de tus compras recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tienes pedidos recientes.</p>
                ) : (
                  recentOrders.map((pedido) => (
                    <div key={pedido._id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-secondary">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Pedido #{pedido._id.slice(-6)}</p>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(pedido.createdAt), { addSuffix: true, locale: es })} • <PriceDisplay price={pedido.total} />
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${pedido.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        pedido.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                        {pedido.status}
                      </span>
                    </div>
                  ))
                )}
                <Link to="/client/pedidos">
                  <Button variant="ghost" className="w-full mt-2 text-muted-foreground">
                    Ver historial completo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">

          {/* Invite Users / Referral */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle className="text-indigo-900 dark:text-indigo-100">Invita a tus amigos</CardTitle>
              <CardDescription className="text-indigo-700/80 dark:text-indigo-300/80">
                ¡Comparte la tienda con tus conocidos para que también puedan comprar los mejores productos!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Invitar Usuarios
              </Button>
            </CardContent>
          </Card>

          {/* Featured / Favorites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Productos Destacados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay productos destacados.</p>
                ) : (
                  featuredProducts.map((producto) => (
                    <div key={producto._id} className="flex items-center justify-between group cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-secondary/50 flex items-center justify-center">
                          <Star className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[120px]">{producto.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
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
