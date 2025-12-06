import React, { useEffect } from 'react';
import { useAuthStore } from '../../auth/store/auth.store';

interface AdComponentProps {
   slotId: string; // ID del bloque de anuncios de AdSense
   format?: 'auto' | 'fluid' | 'rectangle';
   style?: React.CSSProperties;
}

export const AdComponent: React.FC<AdComponentProps> = ({ slotId, format = 'auto', style }) => {
   const user = useAuthStore(state => state.user);

   useEffect(() => {
      // Intentar cargar el anuncio
      try {
         if (window.adsbygoogle && !user?.isPremium) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
         }
      } catch (e) {
         console.error('Error loading AdSense:', e);
      }
   }, [user?.isPremium]);

   // Si el usuario es Premium, no mostrar nada
   if (user?.isPremium) {
      return null;
   }

   return (
      <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
         <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-7231477122084380"
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"></ins>
         <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
            Anuncio - <a href="/client/premium" style={{ color: '#666' }}>Eliminar anuncios</a>
         </div>
      </div>
   );
};

// Declaración global para TypeScript
declare global {
   interface Window {
      adsbygoogle: any[];
   }
}
