import { useState } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { Loader2, Pencil, Trash2, X } from 'lucide-react';
import { PasswordChangeForm } from '../../components/profile/PasswordChangeForm';
import { ExchangeRateForm } from '../../../components/profile/ExchangeRateForm';
import { PaymentConfigForm } from '../../../admin/components/profile/PaymentConfigForm';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { updateProfileAction, requestAccountDeletionAction } from '../../../auth/actions/auth-actions';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../auth/store/auth.store';

export const ClientProfilePage = () => {
   const { user, isLoading } = useProfile();
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const currentView = searchParams.get('view') || 'info';

   const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: ''
   });

   const handleEditClick = () => {
      if (user) {
         setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
         });
         setIsEditing(true);
      }
   };

   const logout = useAuthStore(state => state.logout);

   const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         const emailChanged = user?.email !== formData.email;

         await updateProfileAction(formData);
         await queryClient.invalidateQueries({ queryKey: ['profile'] });

         if (emailChanged) {
            await Swal.fire({
               title: 'Correo actualizado',
               text: 'Tu sesión se cerrará para aplicar los cambios. Por favor, inicia sesión nuevamente con tu nuevo correo.',
               icon: 'success',
               confirmButtonText: 'Entendido'
            });
            logout();
            navigate('/auth/login');
         } else {
            setIsEditing(false);
            Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
         }
      } catch (error: any) {
         Swal.fire('Error', error.message || 'No se pudo actualizar el perfil', 'error');
      }
   };

   const handleRequestDeletion = async () => {
      const { value: reason } = await Swal.fire({
         title: 'Solicitar Eliminación de Cuenta',
         input: 'textarea',
         inputLabel: 'Por favor, indícanos el motivo',
         inputPlaceholder: 'Escribe tu razón aquí...',
         inputAttributes: {
            'aria-label': 'Escribe tu razón aquí'
         },
         showCancelButton: true,
         confirmButtonText: 'Enviar Solicitud',
         cancelButtonText: 'Cancelar',
         confirmButtonColor: '#d33',
         inputValidator: (value) => {
            if (!value) {
               return 'Necesitas escribir un motivo';
            }
         }
      });

      if (reason) {
         try {
            await requestAccountDeletionAction(reason);
            Swal.fire('Solicitud Enviada', 'Tu solicitud ha sido enviada al administrador para su revisión.', 'success');
         } catch (error: any) {
            Swal.fire('Error', error.message || 'No se pudo enviar la solicitud', 'error');
         }
      }
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
         </div>
      );
   }

   const renderContent = () => {
      switch (currentView) {
         case 'password':
            return (
               <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Cambiar Contraseña</h2>
                  <PasswordChangeForm />
               </div>
            );
         case 'rates':
            if (user?.role !== 'admin') return null;
            return (
               <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Tasas de Cambio</h2>
                  <ExchangeRateForm initialRates={user?.exchangeRates} />
               </div>
            );
         case 'payment-config':
            if (user?.role !== 'admin') return null;
            return (
               <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Cobro</h2>
                  <p className="text-gray-600 mb-6">
                     Estos datos se enviarán a tus clientes cuando les envíes un recordatorio de pago.
                  </p>
                  <PaymentConfigForm initialData={user?.payment_config} />
               </div>
            );
         case 'info':
         default:
            return (
               <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
                     <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        <Pencil size={18} />
                        Editar Perfil
                     </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                     <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute -bottom-12 left-8">
                           <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                              <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                 {user?.name?.charAt(0).toUpperCase()}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="pt-16 pb-8 px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                 Nombre Completo
                              </label>
                              <p className="mt-1 text-lg font-medium text-gray-900">{user?.name}</p>
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                 Correo Electrónico
                              </label>
                              <p className="mt-1 text-lg font-medium text-gray-900">{user?.email}</p>
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                 Rol
                              </label>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                      ${user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                 {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                              </span>
                           </div>
                           {user?.phone && (
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Teléfono
                                 </label>
                                 <p className="mt-1 text-lg font-medium text-gray-900">{user.phone}</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {user?.role !== 'admin' && (
                     user?.deletionRequested ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                           <h3 className="text-lg font-semibold text-yellow-800 mb-2">Solicitud en Proceso</h3>
                           <p className="text-yellow-700">
                              Tu solicitud de eliminación de cuenta está siendo verificada por nuestro equipo. Te notificaremos cuando el proceso haya finalizado.
                           </p>
                        </div>
                     ) : (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                           <h3 className="text-lg font-semibold text-red-800 mb-2">Zona de Peligro</h3>
                           <p className="text-red-600 mb-4">
                              Si deseas eliminar tu cuenta, debes enviar una solicitud. Un administrador revisará que no tengas deudas pendientes.
                           </p>
                           <button
                              onClick={handleRequestDeletion}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                           >
                              <Trash2 size={18} />
                              Solicitar Eliminación
                           </button>
                        </div>
                     )
                  )}

                  {/* Edit Modal */}
                  {isEditing && (
                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                           <div className="flex justify-between items-center p-6 border-b border-gray-100">
                              <h3 className="text-xl font-bold text-gray-800">Editar Perfil</h3>
                              <button
                                 onClick={() => setIsEditing(false)}
                                 className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                 <X size={24} />
                              </button>
                           </div>
                           <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Completo
                                 </label>
                                 <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Correo Electrónico
                                 </label>
                                 <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                 </label>
                                 <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                 />
                              </div>
                              <div className="flex justify-end gap-3 pt-4">
                                 <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                 >
                                    Cancelar
                                 </button>
                                 <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                 >
                                    Guardar Cambios
                                 </button>
                              </div>
                           </form>
                        </div>
                     </div>
                  )}
               </div>
            );
      }
   };

   return (
      <div className="p-6">
         {renderContent()}
      </div>
   );
};
