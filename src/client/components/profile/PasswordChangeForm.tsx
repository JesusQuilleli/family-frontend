import { useState } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { Loader2, Lock } from 'lucide-react';

export const PasswordChangeForm = () => {
   const { changePassword } = useProfile();
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

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
         changePassword({ currentPassword, newPassword });
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
      } catch (err) {
         // Error is handled by the mutation in useProfile
      } finally {
         setLoading(false);
      }
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
                     type="password"
                     value={currentPassword}
                     onChange={(e) => setCurrentPassword(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                     required
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                     type="password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                     required
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                     required
                  />
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
