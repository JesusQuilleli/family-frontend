export interface User {
   uid: string;
   name: string;
   email?: string;
   role: string;
   phone?: string;
   isPremium?: boolean;
   membershipExpiresAt?: string | Date;
   adminAsociado?: { uid: string, name: string, phone?: string } | null;
   exchangeRates?: {
      tasaBs: number;
      tasaPesos: number;
      clientCurrency?: 'USD' | 'VES' | 'COP';
   };
   payment_config?: {
      bank_name: string;
      account_number: string;
      account_type: string;
      phone: string;
      identification: string;
      instructions: string;
   };
}
