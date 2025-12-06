import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FamilyApi } from '../api/family.api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = () => {
   const [subscription, setSubscription] = useState<PushSubscription | null>(null);
   const [isSupported, setIsSupported] = useState(false);

   useEffect(() => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
         setIsSupported(true);
         registerServiceWorker();
      }
   }, []);

   const registerServiceWorker = async () => {
      try {
         const registration = await navigator.serviceWorker.ready;
         const sub = await registration.pushManager.getSubscription();
         setSubscription(sub);
      } catch (error) {
         console.error('Error getting service worker subscription:', error);
      }
   };

   const urlBase64ToUint8Array = (base64String: string) => {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
         .replace(/\-/g, '+')
         .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
         outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
   };

   const subscribeToPush = async () => {
      if (!isSupported) {
         toast.error('Las notificaciones push no son soportadas en este navegador.');
         return;
      }

      try {
         console.log('Requesting notification permission...');
         const permission = await Notification.requestPermission();
         if (permission !== 'granted') {
            if (permission === 'denied') {
               toast.error('Las notificaciones están bloqueadas. Por favor habilítalas en la configuración de tu navegador (icono del candado junto a la URL).');
            } else {
               toast.error('Permiso de notificaciones no otorgado.');
            }
            return;
         }

         console.log('Waiting for SW ready...');
         const registration = await navigator.serviceWorker.ready;
         console.log('SW ready, subscribing...');
         const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
         });

         setSubscription(sub);

         // Send subscription to backend
         await FamilyApi.post('/notifications/subscribe', sub);

         toast.success('Notificaciones activadas correctamente.');

      } catch (error) {
         console.error('Error subscribing to push:', error);
         toast.error('Error al activar notificaciones.');
      }
   };

   return {
      subscription,
      subscribeToPush,
      isSupported
   };
};
