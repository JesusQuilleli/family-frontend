import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { forgotPasswordAction } from '../actions/auth-actions';
import { Button } from '@/components/ui/button';

interface ForgotPasswordForm {
   email: string;
}

export default function ForgotPasswordPage() {
   const [isLoading, setIsLoading] = useState(false);
   const [emailSent, setEmailSent] = useState(false);

   const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

   const onSubmit = async (data: ForgotPasswordForm) => {
      setIsLoading(true);
      try {
         await forgotPasswordAction(data.email);
         setEmailSent(true);
         toast.success('Correo de recuperación enviado');
      } catch (error: any) {
         toast.error(error.message || 'Error al enviar correo');
      } finally {
         setIsLoading(false);
      }
   };

   if (emailSent) {
      return (
         <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-600" />
               </div>
               <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Correo Enviado!</h2>
               <p className="text-slate-600 mb-8">
                  Hemos enviado las instrucciones para restablecer tu contraseña a tu correo electrónico.
               </p>
               <Link
                  to="/auth/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
               >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio de sesión
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
               <Link
                  to="/auth/login"
                  className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-6 transition-colors"
               >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
               </Link>
               <h2 className="text-3xl font-bold text-slate-800 mb-2">Recuperar Contraseña</h2>
               <p className="text-slate-600">
                  Ingresa tu correo electrónico y te enviaremos las instrucciones.
               </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                     Correo Electrónico
                  </label>
                  <input
                     {...register('email', {
                        required: 'El correo es requerido',
                        pattern: {
                           value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                           message: 'Correo electrónico inválido'
                        }
                     })}
                     type="email"
                     className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                     placeholder="ejemplo@correo.com"
                  />
                  {errors.email && (
                     <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
               </div>

               <Button
                  type="submit"
                  variant='ghost'
                  disabled={isLoading}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-centers'
               >
                  {isLoading ? (
                     <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                     </>
                  ) : (
                     'Enviar Instrucciones'
                  )}
               </Button>
            </form>
         </div>
      </div>
   );
}
