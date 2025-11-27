export interface Notification {
   _id: string;
   recipient_uid: string;
   title: string;
   message: string;
   type: 'payment_verified' | 'order_status_update' | 'order_rejected' | 'payment_rejected' | 'new_order' | 'new_payment';
   related_id: string;
   read: boolean;
   createdAt: string;
}

export interface NotificationsResponse {
   ok: boolean;
   notifications: Notification[];
   unreadCount: number;
}
