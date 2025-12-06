import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FamilyApi } from '../api/family.api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = () => {
   const [subscription, setSubscription] = useState<PushSubscription | null>(null);
   const [isSupported, setIsSupported] = useState(false);
   const [permission, setPermission] = useState(Notification.permission);

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
         if (import.meta.env.DEV) console.error('Error getting service worker subscription:', error);
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

      if (!VAPID_PUBLIC_KEY) {
         if (import.meta.env.DEV) console.error('VAPID_PUBLIC_KEY is missing');
         toast.error('Error de configuración: Falta la clave pública VAPID.');
         return;
      }

      try {
         if (import.meta.env.DEV) console.log('Requesting notification permission...');
         const perm = await Notification.requestPermission();
         setPermission(perm);

         if (perm !== 'granted') {
            if (perm === 'denied') {
               toast.error('Las notificaciones están bloqueadas. Por favor habilítalas en la configuración de tu navegador.');
            } else {
               toast.error('Permiso de notificaciones no otorgado.');
            }
            return;
         }

         if (import.meta.env.DEV) console.log('Waiting for SW ready...');
         const registration = await navigator.serviceWorker.ready;
         if (import.meta.env.DEV) console.log('SW ready, subscribing...');

         let sub = await registration.pushManager.getSubscription();

         if (!sub) {
            sub = await registration.pushManager.subscribe({
               userVisibleOnly: true,
               applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
         }

         setSubscription(sub);

         // Send subscription to backend
         await FamilyApi.post('/notifications/subscribe', sub);

         toast.success('Notificaciones activadas correctamente.');

      } catch (error: any) {
         if (import.meta.env.DEV) console.error('Error subscribing to push:', error);

         // If subscription failed, it might be due to existing subscription with different key
         // Only try to unsubscribe and resubscribe if we haven't already succeeded
         if (error.name === 'InvalidStateError' || error.message?.includes('Registration failed')) {
            try {
               const registration = await navigator.serviceWorker.ready;
               const existingSub = await registration.pushManager.getSubscription();
               if (existingSub) {
                  await existingSub.unsubscribe();
                  // Retry subscription once
                  const newSub = await registration.pushManager.subscribe({
                     userVisibleOnly: true,
                     applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                  });
                  setSubscription(newSub);
                  await FamilyApi.post('/notifications/subscribe', newSub);
                  toast.success('Notificaciones activadas correctamente (recuperado).');
                  return;
               }
            } catch (retryError) {
               if (import.meta.env.DEV) console.error('Retry failed:', retryError);
            }
         }

         toast.error(`Error al activar notificaciones: ${error?.message || 'Error desconocido'}`);
      }
   };

   return {
      subscription,
      subscribeToPush,
      isSupported,
      permission
   };
};
