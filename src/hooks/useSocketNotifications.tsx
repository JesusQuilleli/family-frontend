import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const useSocketNotifications = () => {
   const { socket } = useSocket();
   const queryClient = useQueryClient();

   useEffect(() => {
      if (!socket) return;

      // Listeners
      socket.on('new-payment', (data: { title: string, message: string }) => {
         //console.log('🔔 Socket Event Received: new-payment', data);
         toast.info(data.title, {
            description: data.message,
            duration: 5000,
         });
         queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socket.on('new-order', (data: { title: string, message: string }) => {
         //console.log('🔔 Socket Event Received: new-order', data);
         toast.info(data.title, {
            description: data.message,
            duration: 5000,
         });
         queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socket.on('payment-updated', (data: { title: string, message: string, status: string }) => {
         //console.log('🔔 Socket Event Received: payment-updated', data);
         const type = data.status === 'verified' ? 'success' : 'error';
         toast[type](data.title, {
            description: data.message,
            duration: 5000,
         });
         queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socket.on('order-updated', (data: { title: string, message: string, status: string }) => {
         //console.log('🔔 Socket Event Received: order-updated', data);
         toast.info(data.title, {
            description: data.message,
            duration: 5000,
         });
         queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socket.on('payment-reminder', (data: any) => {
         //console.log('🔔 Socket Event Received: payment-reminder', data);
         toast.info(data.title, {
            description: (
               <div className="space-y-2">
                  <p>{data.message}</p>
                  {data.paymentConfig && (
                     <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100 mt-2">
                        <p className="font-semibold text-blue-800">Datos de Pago:</p>
                        <p><span className="font-medium">Banco:</span> {data.paymentConfig.bank_name}</p>
                        <p><span className="font-medium">Cuenta:</span> {data.paymentConfig.account_number}</p>
                        <p><span className="font-medium">Tipo:</span> {data.paymentConfig.account_type}</p>
                        <p><span className="font-medium">Cédula:</span> {data.paymentConfig.identification}</p>
                        <p><span className="font-medium">Teléfono:</span> {data.paymentConfig.phone}</p>
                        {data.paymentConfig.instructions && (
                           <p className="mt-1 italic text-blue-600">{data.paymentConfig.instructions}</p>
                        )}
                     </div>
                  )}
               </div>
            ),
            duration: 10000,
         });
         queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socket.on('new-notification', (data: { title: string, message: string }) => {
         //console.log('🔔 Socket Event Received: new-notification', data);
         toast.info(data.title, {
            description: data.message,
            duration: 5000,
         });
         queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      return () => {
         socket.off('new-payment');
         socket.off('new-order');
         socket.off('payment-updated');
         socket.off('order-updated');
         socket.off('payment-reminder');
         socket.off('new-notification');
      };
   }, [socket]);
};
