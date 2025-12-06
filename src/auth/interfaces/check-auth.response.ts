import type { User } from "@/interfaces/user.interface";

export interface AuthResponse {
   ok: boolean;
   msg: string;
   token: string;
   user: User;
}
