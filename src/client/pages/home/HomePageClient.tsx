import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, Package, ArrowRight, Star, MessageCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/custom/Header";
import { useAuthStore } from "@/auth/store/auth.store";
import { Link } from "react-router-dom";
import { useClientDashboard } from "@/client/hooks/useClientDashboard";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { LoadingSpinner } from "@/components/admin-products/LoadingSpinner";
import { useCategories } from "@/hooks/useCategories";
import { getImageUrl } from "@/helpers/get-image-url";
import { ImageWithLoader } from "@/components/common/ImageWithLoader";

export const HomePageClient = () => {
  const { user } = useAuthStore();
  const { recentOrders, featuredProducts, isLoading: isLoadingDashboard } = useClientDashboard();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  //console.log(user);

  const isLoading = isLoadingDashboard || isLoadingCategories;

  // Default icons for categories if they don't have images
  const defaultCategoryIcons = ["💻", "👕", "🏠", "⚽", "🎮", "💄", "📚", "🚗"];

  if (isLoading) {
    return <LoadingSpinner title="Cargando tu experiencia de compra..." />;
  }

  const categories = categoriesData?.categories || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Header
        title={`¡Hola, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle={`Bienvenido a la tienda de ${user?.adminAsociado?.name || 'tu proveedor'}.`}
      />

      {/* Hero / Promo Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner Comprar */}
        <div className="relative overflow-hidden rounded-xl shadow-lg text-white min-h-[300px] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/banner.png"
              alt="Banner Tienda"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Los mejores productos para ti.
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-6">
              Descubre nuestra variedad y calidad al mejor precio.
            </p>
            <Link to="/client/productos">
              <Button size="lg" className="font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-none w-full sm:w-auto">
                <ShoppingBag className="h-5 w-5" />
                Ir a Comprar
              </Button>
            </Link>
          </div>
        </div>

        {/* Banner Pagar */}
        <div className="relative overflow-hidden rounded-xl shadow-lg text-white min-h-[300px] flex items-center bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-4 backdrop-blur-sm border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Estado de Cuenta
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Mantén tus cuentas al día
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-6">
              Revisa el estado de tus pedidos y realiza tus pagos pendientes de forma sencilla.
            </p>
            <Link to="/client/pedidos">
              <Button size="lg" variant="secondary" className="font-semibold gap-2 w-full sm:w-auto hover:bg-white/90">
                <CreditCard className="h-5 w-5" />
                Ir a Pagar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Categories */}
          {categories.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Categorías</h3>
                <Link to="/client/productos">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Ver todas
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categories.slice(0, 8).map((category, index) => (
                  <Link key={category._id} to={`/client/productos?categoryId=${category._id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-none shadow-sm bg-secondary/20">
                      <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                        <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center text-2xl shadow-sm overflow-hidden">
                          {category.image ? (
                            <ImageWithLoader
                              src={getImageUrl(category.image)}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{defaultCategoryIcons[index % defaultCategoryIcons.length]}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium leading-none">{category.name}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

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
                    <div key={pedido._id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b last:border-0 pb-4 last:pb-0 gap-4 sm:gap-0">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-secondary shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">Pedido #{pedido._id.slice(-6)}</p>
                          <div className="text-xs text-muted-foreground truncate">
                            {formatDistanceToNow(new Date(pedido.createdAt), { addSuffix: true, locale: es })} • <PriceDisplay price={pedido.total} />
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full self-start sm:self-auto ${pedido.status === 'delivered' ? 'bg-green-100 text-green-600' :
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

          {/* Contact Seller Section */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/20 blur-xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-20 w-20 rounded-full bg-white/20 blur-xl" />

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageCircle className="h-5 w-5" />
                ¿Necesitas ayuda?
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-green-100">
                Si tienes dudas sobre cómo comprar o necesitas asistencia, contáctanos directamente.
              </p>

              {user?.adminAsociado?.phone ? (
                <a
                  href={`https://wa.me/${user.adminAsociado.phone.replace(/\D/g, '')}?text=Hola, necesito ayuda con mi pedido en la tienda virtual.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="secondary" className="w-full font-semibold text-green-700 hover:text-green-800 gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contactar por WhatsApp
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" disabled className="w-full font-semibold text-green-700/50 gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp no disponible
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Datos de Transferencia */}
          {user?.adminAsociado?.payment_config && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Datos de Transferencia
                </CardTitle>
                <CardDescription>
                  Realiza tus pagos a la siguiente cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-2 p-3 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco:</span>
                    <span className="font-medium text-right">{user.adminAsociado.payment_config.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Titular:</span>
                    <span className="font-medium text-right">{user.adminAsociado.payment_config.identification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cuenta:</span>
                    <span className="font-mono font-medium text-right select-all">
                      {user.adminAsociado.payment_config.account_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium text-right capitalize">{user.adminAsociado.payment_config.account_type}</span>
                  </div>
                  {user.adminAsociado.payment_config.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Móvil Pago:</span>
                      <span className="font-medium text-right">{user.adminAsociado.payment_config.phone}</span>
                    </div>
                  )}
                </div>
                {user.adminAsociado.payment_config.instructions && (
                  <div className="text-xs text-muted-foreground bg-blue-50 text-blue-700 p-2 rounded border border-blue-100">
                    {user.adminAsociado.payment_config.instructions}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Featured / Favorites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Productos Comprados Recientemente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No has comprado productos recientemente.</p>
                ) : (
                  featuredProducts.map((producto) => (
                    <div key={producto._id} className="flex items-center justify-between group cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-md bg-secondary/50 flex items-center justify-center shrink-0">
                          <Star className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium truncate">{producto.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
