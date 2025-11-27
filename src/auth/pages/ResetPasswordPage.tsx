import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { resetPasswordAction } from '../actions/auth-actions';

interface ResetPasswordForm {
   password: string;
   confirmPassword: string;
}

export default function ResetPasswordPage() {
   const { token } = useParams();
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);

   const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();

   const onSubmit = async (data: ResetPasswordForm) => {
      if (!token) {
         toast.error('Token inválido');
         return;
      }

      setIsLoading(true);
      try {
         await resetPasswordAction(token, data.password);
         setIsSuccess(true);
         toast.success('Contraseña restablecida correctamente');

         // Redirigir después de 3 segundos
         setTimeout(() => {
            navigate('/auth/login');
         }, 3000);

      } catch (error: any) {
         toast.error(error.message || 'Error al restablecer contraseña');
      } finally {
         setIsLoading(false);
      }
   };

   if (isSuccess) {
      return (
         <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
               </div>
               <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Contraseña Actualizada!</h2>
               <p className="text-slate-600 mb-8">
                  Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión en unos segundos.
               </p>
               <Link
                  to="/auth/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
               >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ir al inicio de sesión ahora
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
               <h2 className="text-3xl font-bold text-slate-800 mb-2">Nueva Contraseña</h2>
               <p className="text-slate-600">
                  Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
               </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                     Nueva Contraseña
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                        {...register('password', {
                           required: 'La contraseña es requerida',
                           minLength: {
                              value: 6,
                              message: 'Mínimo 6 caracteres'
                           }
                        })}
                        type="password"
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        placeholder="••••••••"
                     />
                  </div>
                  {errors.password && (
                     <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                     Confirmar Contraseña
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                     </div>
                     <input
                        {...register('confirmPassword', {
                           required: 'Confirma tu contraseña',
                           validate: (val: string) => {
                              if (watch('password') != val) {
                                 return "Las contraseñas no coinciden";
                              }
                           }
                        })}
                        type="password"
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        placeholder="••••••••"
                     />
                  </div>
                  {errors.confirmPassword && (
                     <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
               </div>

               <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
               >
                  {isLoading ? (
                     <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Actualizando...
                     </>
                  ) : (
                     'Restablecer Contraseña'
                  )}
               </button>
            </form>
         </div>
      </div>
   );
}
