import { ArrowRight, ShoppingBag, ClipboardList, CreditCard, BarChart3, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';

export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-indigo-50/50 via-purple-50/30 to-slate-50 -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Gestiona tu negocio <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
                con facilidad y estilo
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600 mb-10">
              Todo lo que necesitas para vender, organizar pedidos y crecer.
              Una plataforma diseñada para simplificar tu día a día.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/auth/login')}
                className="group inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
              Todo en un solo lugar
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Herramientas potentes diseñadas para que te enfoques en lo que realmente importa: tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ShoppingBag className="w-8 h-8 text-indigo-600" />}
              title="Gestión de Productos"
              description="Organiza tu inventario con categorías, precios y stock en tiempo real."
            />
            <FeatureCard
              icon={<ClipboardList className="w-8 h-8 text-purple-600" />}
              title="Control de Pedidos"
              description="Recibe y procesa pedidos de tus clientes de forma rápida y ordenada."
            />
            <FeatureCard
              icon={<CreditCard className="w-8 h-8 text-pink-600" />}
              title="Pagos Simplificados"
              description="Registra pagos y mantén las cuentas claras con tus clientes."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-teal-600" />}
              title="Estadísticas Claras"
              description="Visualiza el crecimiento de tu negocio con reportes fáciles de entender."
            />
          </div>
        </div>
      </section>

      {/* Motivation Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                ¿Por qué elegir nuestra App?
              </h2>
              <div className="space-y-6">
                <BenefitItem
                  icon={<ShieldCheck className="w-6 h-6 text-green-600" />}
                  title="Seguro y Confiable"
                  description="Tus datos y los de tus clientes están protegidos con la mejor tecnología."
                />
                <BenefitItem
                  icon={<Zap className="w-6 h-6 text-yellow-500" />}
                  title="Rápido y Eficiente"
                  description="Interfaz optimizada para que realices tus tareas en segundos."
                />
                <BenefitItem
                  icon={<CheckCircle2 className="w-6 h-6 text-blue-600" />}
                  title="Fácil de Usar"
                  description="Diseño intuitivo que no requiere conocimientos técnicos previos."
                />
              </div>
            </div>
            <div className="relative h-96 rounded-2xl bg-slate-100 overflow-hidden shadow-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 to-purple-500/10" />
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
                  <ShoppingBag className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Tu Negocio</h3>
                <p className="text-slate-600">Listo para el siguiente nivel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Programmer Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-12">
            Sobre el Desarrollador
          </h2>
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="md:flex">
              <div className="md:shrink-0 bg-slate-900 flex items-center justify-center p-8 md:w-48">
                <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center text-white text-3xl font-bold">
                  JQ
                </div>
              </div>
              <div className="p-8 text-left">
                <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">Programador</div>
                <h3 className="block mt-1 text-2xl leading-tight font-bold text-black">Jesus Quilelli</h3>
                <p className="mt-2 text-slate-500">
                  Nacionalidad: Venezolano 🇻🇪
                </p>
                <p className="mt-4 text-slate-600">
                  Estoy disponible para cualquier implementación, corrección de bugs o mejoras que necesites.
                  Comprometido con entregar software de alta calidad.
                </p>
                <div className="mt-6 flex items-center gap-2 text-slate-700 font-medium">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                    jqcelis092@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© {new Date().getFullYear()} </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <div className="mb-4 p-3 bg-slate-50 rounded-xl inline-block">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">
      {description}
    </p>
  </div>
);

const BenefitItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex gap-4">
    <div className="shrink-0 mt-1">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-slate-600">{description}</p>
    </div>
  </div>
);


