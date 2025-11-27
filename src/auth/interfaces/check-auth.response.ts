export interface AuthResponse {
   ok: boolean;
   msg: string;
   token: string;
   user: User;
}

export interface User {
   uid: string;
   name: string;
   email?: string
   role: string;
   adminAsociado: { uid: string; name: string } | null;
}
