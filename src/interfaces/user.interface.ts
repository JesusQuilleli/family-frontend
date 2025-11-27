export interface User {
   uid: string;
   name: string;
   email?: string;
   role: string;
   phone?: string;
   adminAsociado?: { uid: string, name: string } | null;
   exchangeRates?: {
      tasaBs: number;
      tasaPesos: number;
      clientCurrency?: 'USD' | 'VES' | 'COP';
   };
}
