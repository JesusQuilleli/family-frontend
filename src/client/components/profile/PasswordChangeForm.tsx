import { useState } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

import { useAuthStore } from '../../../auth/store/auth.store';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const PasswordChangeForm = () => {
   const { changePassword } = useProfile();
   const logout = useAuthStore(state => state.logout);
   const navigate = useNavigate();
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   // Visibility states
   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (newPassword !== confirmPassword) {
         setError('Las contraseñas nuevas no coinciden');
         return;
      }

      if (newPassword.length < 6) {
         setError('La contraseña debe tener al menos 6 caracteres');
         return;
      }

      setLoading(true);
      try {
         changePassword({ currentPassword, newPassword }, {
            onSuccess: async () => {
               setCurrentPassword('');
               setNewPassword('');
               setConfirmPassword('');

               await Swal.fire({
                  title: 'Contraseña actualizada',
                  text: 'Tu sesión se cerrará para aplicar los cambios. Por favor, inicia sesión nuevamente con tu nueva contraseña.',
                  icon: 'success',
                  confirmButtonText: 'Entendido'
               });
               logout();
               navigate('/auth/login');
            }
         });
      } catch (err) {
         // Error is handled by the mutation in useProfile
      } finally {
         setLoading(false);
      }
   };

   const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      setter(prev => !prev);
   };

   return (
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
               {error}
            </div>
         )}

         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                     type={showCurrentPassword ? "text" : "password"}
                     value={currentPassword}
                     onChange={(e) => setCurrentPassword(e.target.value)}
                     className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                     required
                     maxLength={16}
                  />
                  <button
                     type="button"
                     onClick={() => toggleVisibility(setShowCurrentPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                     {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                     ) : (
                        <Eye className="w-4 h-4" />
                     )}
                  </button>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                     type={showNewPassword ? "text" : "password"}
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                     required
                     maxLength={16}
                  />
                  <button
                     type="button"
                     onClick={() => toggleVisibility(setShowNewPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                     {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                     ) : (
                        <Eye className="w-4 h-4" />
                     )}
                  </button>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                     type={showConfirmPassword ? "text" : "password"}
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                     required
                     maxLength={16}
                  />
                  <button
                     type="button"
                     onClick={() => toggleVisibility(setShowConfirmPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                     {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                     ) : (
                        <Eye className="w-4 h-4" />
                     )}
                  </button>
               </div>
            </div>

            <div className="pt-2">
               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {loading ? (
                     <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Actualizando...
                     </>
                  ) : (
                     'Actualizar Contraseña'
                  )}
               </button>
            </div>
         </div>
      </form>
   );
};
