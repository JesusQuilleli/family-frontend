import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../auth/store/auth.store';

interface SocketContextProps {
   socket: Socket | null;
   online: boolean;
}

const SocketContext = createContext<SocketContextProps>({
   socket: null,
   online: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
   const { token, authStatus } = useAuthStore();
   const [socket, setSocket] = useState<Socket | null>(null);
   const [online, setOnline] = useState(false);

   useEffect(() => {
      if (authStatus === 'authenticated' && token) {
         const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

         let socketUrl = apiUrl;
         try {
            const url = new URL(apiUrl);
            socketUrl = url.origin;
         } catch (error) {
            console.error('❌ URL de API inválida:', apiUrl);
            socketUrl = apiUrl.replace('/api', '');
         }

         console.log('🔌 Intentando conectar socket...', socketUrl);

         const newSocket = io(socketUrl, {
            auth: {
               token
            },
            transports: ['websocket'] // Force websocket to avoid polling issues
         });

         setSocket(newSocket);

         newSocket.on('connect', () => {
            console.log('✅ Socket conectado:', newSocket.id);
            setOnline(true);
         });

         newSocket.on('connect_error', (err) => {
            console.error('❌ Error de conexión socket:', err.message);
         });

         newSocket.on('disconnect', () => {
            console.log('❌ Socket desconectado');
            setOnline(false);
         });

         newSocket.on('force-logout', (payload: any) => {
            console.log('🚪 Force logout recibido:', payload);
            useAuthStore.getState().logout();
            // Opcional: Mostrar alerta o redirigir
            alert(payload.msg || 'Tu sesión ha sido cerrada.');
            window.location.href = '/auth/login';
         });

         return () => {
            newSocket.disconnect();
         };
      } else {
         if (socket) {
            socket.disconnect();
            setSocket(null);
            setOnline(false);
         }
      }
   }, [authStatus, token]);

   return (
      <SocketContext.Provider value={{ socket, online }}>
         {children}
      </SocketContext.Provider>
   );
};
