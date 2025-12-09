import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { FamilyApi } from '../api/family.api';
import { LoadingSpinner } from '@/components/admin-products/LoadingSpinner';

interface Notification {
   _id: string;
   title: string;
   message: string;
   type: string;
   read: boolean;
   createdAt: string;
   data?: any;
}

const NotificationsPage = () => {
   const queryClient = useQueryClient();
   const { subscribeToPush, subscription, isSupported, permission } = usePushNotifications();

   const { data, isLoading } = useQuery({
      queryKey: ['notifications'],
      queryFn: async () => {
         const res = await FamilyApi.get('/notifications');
         return res.data;
      }
   });

   const markReadMutation = useMutation({
      mutationFn: async (id: string) => {
         await FamilyApi.put(`/notifications/read/${id}`);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
   });

   const handleMarkAllRead = () => {
      markReadMutation.mutate('all');
      toast.success('Todas las notificaciones marcadas como leídas');
   };

   if (isLoading) return <LoadingSpinner title='Cargando notificaciones...' />;

   return (
      <div className="container mx-auto p-4 max-w-2xl">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
               <Bell className="w-6 h-6" /> Notificaciones
            </h1>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
               {isSupported && !subscription && permission !== 'granted' && (
                  <button
                     onClick={subscribeToPush}
                     className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                  >
                     Activar Notificaciones
                  </button>
               )}
               <button
                  onClick={handleMarkAllRead}
                  className="text-gray-600 hover:text-blue-600 text-sm flex items-center gap-1"
               >
                  <Check className="w-4 h-4" /> Marcar todo leído
               </button>
            </div>
         </div>

         <div className="space-y-3">
            {data?.notifications.length === 0 ? (
               <p className="text-center text-gray-500 py-8">No tienes notificaciones.</p>
            ) : (
               data?.notifications.map((notif: Notification) => (
                  <div
                     key={notif._id}
                     className={`p-4 rounded-lg border transition-colors ${notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                        }`}
                     onClick={() => !notif.read && markReadMutation.mutate(notif._id)}
                  >
                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className={`font-semibold ${notif.read ? 'text-gray-800' : 'text-blue-800'}`}>
                              {notif.title}
                           </h3>
                           <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                           <span className="text-xs text-gray-400 mt-2 block">
                              {format(new Date(notif.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                           </span>
                        </div>
                        {!notif.read && (
                           <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                        )}
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default NotificationsPage;
