import { Mail } from 'lucide-react';

export const EmailConfigForm = () => {
   return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Configuración de correo próximamente</p>
         </div>
      </div>
   );
};
