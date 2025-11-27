import { FamilyApi } from "@/api/family.api";
import type { Notification, NotificationsResponse } from "@/interfaces/notifications.interface";

export const getNotificationsAction = async (): Promise<NotificationsResponse> => {
   try {
      const { data } = await FamilyApi.get<NotificationsResponse>("/notifications");
      return data;
   } catch (error) {
      console.log(error);
      throw new Error("No se pudieron obtener las notificaciones");
   }
};

export const markNotificationAsReadAction = async (id: string): Promise<Notification> => {
   try {
      const { data } = await FamilyApi.put<{ ok: boolean; notification: Notification }>(`/notifications/${id}/read`);
      return data.notification;
   } catch (error) {
      console.log(error);
      throw new Error("No se pudo marcar como leída");
   }
};

export const markAllNotificationsAsReadAction = async (): Promise<boolean> => {
   try {
      await FamilyApi.put("/notifications/read-all");
      return true;
   } catch (error) {
      console.log(error);
      throw new Error("No se pudieron marcar todas como leídas");
   }
};
