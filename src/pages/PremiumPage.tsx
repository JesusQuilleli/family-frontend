import { useAuthStore } from '../auth/store/auth.store';
import { Star, Check, Shield, Zap } from 'lucide-react';

export const PremiumPage = () => {
   const { user } = useAuthStore();


   if (user?.isPremium) {
      return (
         <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-2 border-yellow-400">
               <div className="flex justify-center mb-4">
                  <div className="bg-yellow-100 p-4 rounded-full">
                     <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
                  </div>
               </div>
               <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Eres Premium!</h1>
               <p className="text-gray-600 mb-6">
                  Disfruta de todos los beneficios exclusivos y una experiencia sin interrupciones.
               </p>
               <div className="space-y-3 text-left mb-8">
                  <div className="flex items-center gap-3">
                     <Check className="w-5 h-5 text-green-500" />
                     <span className="text-gray-700">Sin anuncios molestos</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Check className="w-5 h-5 text-green-500" />
                     <span className="text-gray-700">Soporte prioritario</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Check className="w-5 h-5 text-green-500" />
                     <span className="text-gray-700">Acceso anticipado a novedades</span>
                  </div>
               </div>
               <div className="text-sm text-gray-500">
                  Tu membresía expira el: {user.membershipExpiresAt ? new Date(user.membershipExpiresAt).toLocaleDateString() : 'Nunca'}
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Membresía Premium</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
               Mejora tu experiencia
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
               Elimina los anuncios y apoya el desarrollo de la plataforma.
            </p>
         </div>

         <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden lg:flex lg:max-w-4xl lg:mx-auto border border-gray-100">
            <div className="p-8 lg:flex-1 lg:p-12">
               <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Plan Premium
               </h3>
               <p className="mt-6 text-base text-gray-500">
                  Obtén acceso completo y sin distracciones. Ideal para usuarios frecuentes que valoran la velocidad y la limpieza visual.
               </p>
               <div className="mt-8">
                  <div className="flex items-center">
                     <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-indigo-600">
                        ¿Qué incluye?
                     </h4>
                     <div className="flex-1 border-t-2 border-gray-200"></div>
                  </div>
                  <ul className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
                     <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                           <Shield className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                           Navegación 100% sin anuncios
                        </p>
                     </li>
                     <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                           <Zap className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                           Carga más rápida
                        </p>
                     </li>
                     <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                           <Star className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                           Insignia de usuario Premium
                        </p>
                     </li>
                  </ul>
               </div>
            </div>
            <div className="py-8 px-6 text-center bg-gray-50 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
               <p className="text-lg leading-6 font-medium text-gray-900">
                  Pago único anual
               </p>
               <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
                  <span>$10</span>
                  <span className="ml-3 text-xl font-medium text-gray-500">
                     USD
                  </span>
               </div>

               <div className="mt-6">
                  <p className="mb-4 text-sm text-gray-600">
                     Para activar tu membresía, realiza el pago y envía el comprobante a tu vendedor.
                  </p>

                  {user?.adminAsociado && user.adminAsociado.phone ? (
                     <button
                        onClick={() => {
                           const message = `Hola, quiero activar mi membresía Premium en la App Family.`;
                           const phone = user?.adminAsociado?.phone || '';
                           const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                           window.open(url, '_blank');
                        }}
                        className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out shadow-md gap-2"
                     >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contactar Vendedor
                     </button>
                  ) : (
                     <div className="text-indigo-600 font-semibold bg-indigo-50 p-3 rounded-lg">
                        Contacta a tu vendedor para activar.
                     </div>
                  )}
               </div>
               <p className="mt-4 text-xs text-gray-500">
                  La activación es manual una vez confirmado el pago.
               </p>
            </div>
         </div>
      </div>
   );
};
