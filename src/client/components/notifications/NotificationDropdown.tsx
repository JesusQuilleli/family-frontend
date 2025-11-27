import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ShoppingBag, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
   getNotificationsAction,
   markNotificationAsReadAction,
   markAllNotificationsAsReadAction,
} from "@/client/actions/notifications/notification-actions";
import { cn } from "@/lib/utils";
import type { Notification as NotificationModel } from "@/interfaces/notifications.interface";

export const NotificationDropdown = () => {
   const [open, setOpen] = useState(false);
   const queryClient = useQueryClient();
   const navigate = useNavigate();

   const { data, isLoading } = useQuery({
      queryKey: ["notifications"],
      queryFn: getNotificationsAction,
      refetchInterval: 30000, // Polling every 30 seconds
   });

   const markAsReadMutation = useMutation({
      mutationFn: markNotificationAsReadAction,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
   });

   const markAllAsReadMutation = useMutation({
      mutationFn: markAllNotificationsAsReadAction,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
   });

   const handleNotificationClick = (notification: NotificationModel) => {
      if (!notification.read) {
         markAsReadMutation.mutate(notification._id);
      }
      setOpen(false);

      if (notification.type === 'new_order') {
         navigate(`/admin/pedidos`);
      } else if (notification.type === 'new_payment') {
         navigate(`/admin/pagos`);
      }
   };

   const getIcon = (type: string) => {
      switch (type) {
         case 'new_order':
            return <ShoppingBag className="h-4 w-4 text-blue-500" />;
         case 'new_payment':
            return <CreditCard className="h-4 w-4 text-green-500" />;
         case 'order_rejected':
         case 'payment_rejected':
            return <AlertCircle className="h-4 w-4 text-red-500" />;
         case 'payment_verified':
         case 'order_status_update':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
         default:
            return <Bell className="h-4 w-4 text-gray-500" />;
      }
   };

   const unreadCount = data?.unreadCount || 0;

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
               <Bell className="h-5 w-5" />
               {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
               )}
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
               <h4 className="font-semibold leading-none">Notificaciones</h4>
               {unreadCount > 0 && (
                  <Button
                     variant="ghost"
                     size="sm"
                     className="h-auto px-2 text-xs text-muted-foreground"
                     onClick={() => markAllAsReadMutation.mutate()}
                     disabled={markAllAsReadMutation.isPending}
                  >
                     <CheckCheck className="mr-1 h-3 w-3" />
                     Marcar todo leído
                  </Button>
               )}
            </div>
            <ScrollArea className="h-[300px]">
               {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                     Cargando...
                  </div>
               ) : data?.notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                     No tienes notificaciones
                  </div>
               ) : (
                  <div className="grid">
                     {data?.notifications.map((notification) => (
                        <div
                           key={notification._id}
                           className={cn(
                              "flex flex-col gap-1 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                              !notification.read && "bg-muted/20"
                           )}
                           onClick={() => handleNotificationClick(notification)}
                        >
                           <div className="flex items-start gap-3">
                              <div className="mt-1 shrink-0">
                                 {getIcon(notification.type)}
                              </div>
                              <div className="flex-1 space-y-1">
                                 <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-sm leading-none">
                                       {notification.title}
                                    </span>
                                    {!notification.read && (
                                       <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                                    )}
                                 </div>
                                 <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                 </p>
                                 <span className="text-[10px] text-muted-foreground/70">
                                    {format(new Date(notification.createdAt), "PP p", {
                                       locale: es,
                                    })}
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </ScrollArea>
         </PopoverContent>
      </Popover>
   );
};
