import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Save, Mail, Info } from 'lucide-react';
import { FamilyApi } from '@/api/family.api';

interface EmailConfigFormProps {
   onSuccess?: () => void;
}

interface EmailConfigFormData {
   emailPassword: string;
}

export const EmailConfigForm = ({ onSuccess }: EmailConfigFormProps) => {
   const [isLoading, setIsLoading] = useState(false);
   const { register, handleSubmit, formState: { errors }, reset } = useForm<EmailConfigFormData>();

   const onSubmit = async (data: EmailConfigFormData) => {
      setIsLoading(true);
      try {
         await FamilyApi.put('/auth/email-config', data);
         toast.success('Configuración de correo actualizada correctamente');
         reset();
         if (onSuccess) onSuccess();
      } catch (error: any) {
         console.error(error);
         toast.error(error.response?.data?.msg || 'Error al actualizar la configuración');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
         <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Configuración de Correo (SMTP)</h2>
         </div>

         <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
            <div className="flex gap-2">
               <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
               <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">¿Para qué sirve esto?</p>
                  <p className="mb-2">
                     Configura tu contraseña de aplicación para que las facturas se envíen desde tu propio correo electrónico en lugar del correo del sistema.
                  </p>
                  <p className="font-medium mb-1">¿Cómo obtenerla?</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1">
                     <li>Ve a tu cuenta de Google {'>'} Seguridad.</li>
                     <li>Activa la "Verificación en 2 pasos".</li>
                     <li>Busca "Contraseñas de aplicaciones".</li>
                     <li>Genera una nueva contraseña para "Correo" y copia el código de 16 caracteres.</li>
                  </ol>
               </div>
            </div>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña de Aplicación (App Password)
               </label>
               <input
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.emailPassword ? 'border-red-500' : 'border-gray-300'
                     }`}
                  {...register('emailPassword', {
                     required: 'La contraseña de aplicación es requerida',
                     minLength: {
                        value: 16,
                        message: 'La contraseña debe tener al menos 16 caracteres'
                     }
                  })}
               />
               {errors.emailPassword && (
                  <span className="text-xs text-red-500 mt-1">{errors.emailPassword.message}</span>
               )}
               <p className="text-xs text-gray-500 mt-1">
                  Esta contraseña se guardará de forma segura y solo se usará para enviar facturas a tus clientes.
               </p>
            </div>

            <div className="flex justify-end pt-2">
               <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                  {isLoading ? (
                     <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                     </>
                  ) : (
                     <>
                        <Save className="w-4 h-4" />
                        Guardar Configuración
                     </>
                  )}
               </button>
            </div>
         </form>
      </div>
   );
};
