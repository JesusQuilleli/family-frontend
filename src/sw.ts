/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

// let allowlist: undefined | RegExp[]
// if (import.meta.env.DEV)
//   allowlist = [/^\/$/]

// to allow work offline
registerRoute(new NavigationRoute(
   createHandlerBoundToURL('index.html'),
   // { allowlist }
))

self.skipWaiting()
clientsClaim()

// 🔔 Push Notification Handler
self.addEventListener('push', (event) => {
   const data = event.data ? event.data.json() : {};
   const title = data.title || 'Nueva Notificación';
   const options = {
      body: data.body || 'Tienes una nueva actualización.',
      icon: '/tienda.png', // Ensure this path is correct
      badge: '/tienda.png',
      data: {
         url: data.url || '/'
      }
   };

   event.waitUntil(
      self.registration.showNotification(title, options)
   );
});

// 🔔 Notification Click Handler
self.addEventListener('notificationclick', (event) => {
   event.notification.close();

   event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
         // Check if there's already a window open
         for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
               return client.focus();
            }
         }
         // If not, open a new window
         if (self.clients.openWindow) {
            return self.clients.openWindow(event.notification.data.url);
         }
      })
   );
});
