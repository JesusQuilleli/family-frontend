import { useForm } from 'react-hook-form';
import { useProfile } from '../../../hooks/useProfile';
import { useEffect } from 'react';

interface PaymentConfig {
   bank_name: string;
   account_number: string;
   account_type: string;
   phone: string;
   identification: string;
   instructions: string;
}

interface Props {
   initialData?: PaymentConfig;
}

export const PaymentConfigForm = ({ initialData }: Props) => {
   const { updateProfile, isUpdating } = useProfile();

   const { register, handleSubmit, reset } = useForm<PaymentConfig>({
      defaultValues: {
         bank_name: '',
         account_number: '',
         account_type: '',
         phone: '',
         identification: '',
         instructions: ''
      }
   });

   useEffect(() => {
      if (initialData) {
         reset(initialData);
      }
   }, [initialData, reset]);

   const onSubmit = async (data: PaymentConfig) => {
      await updateProfile({ payment_config: data });
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
               <input
                  type="text"
                  {...register('bank_name')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Banesco"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta</label>
               <input
                  type="text"
                  {...register('account_number')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0134..."
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta</label>
               <select
                  {...register('account_type')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               >
                  <option value="">Seleccionar...</option>
                  <option value="Corriente">Corriente</option>
                  <option value="Ahorro">Ahorro</option>
                  <option value="Pago Móvil">Pago Móvil</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Pago Móvil)</label>
               <input
                  type="text"
                  {...register('phone')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0414..."
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / RIF</label>
               <input
                  type="text"
                  {...register('identification')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="V-12345678"
               />
            </div>
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones Adicionales</label>
            <textarea
               {...register('instructions')}
               className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
               placeholder="Ej: Enviar captura de pantalla al WhatsApp..."
            />
         </div>

         <div className="flex justify-end">
            <button
               type="submit"
               disabled={isUpdating}
               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
               {isUpdating ? 'Guardando...' : 'Guardar Configuración'}
            </button>
         </div>
      </form>
   );
};
