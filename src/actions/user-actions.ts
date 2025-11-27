import { FamilyApi } from "../api/family.api";

export interface AdminAsociado {
   _id: string;
   name: string;
   email: string;
}

export interface User {
   uid: string;
   name: string;
   email: string;
   role: string;
   adminAsociado?: string | AdminAsociado;
   phone?: string;
   createdAt?: string;
   exchangeRates?: {
      tasaBs: number;
      tasaPesos: number;
      clientCurrency?: 'USD' | 'VES' | 'COP';
   };
}

export interface UsersResponse {
   ok: boolean;
   users: User[];
   totalUsers: number;
   totalPages: number;
   currentPage: number;
}

interface ProfileResponse {
   ok: boolean;
   user: User;
}

export const getUserProfile = async (): Promise<User> => {
   const { data } = await FamilyApi.get<ProfileResponse>('/auth/profile');
   return data.user;
}

export const getAllUsers = async (page = 1, limit = 10, search = ''): Promise<UsersResponse> => {
   const { data } = await FamilyApi.get<UsersResponse>(`/auth/users?page=${page}&limit=${limit}&search=${search}`);
   return data;
}

export const getUserById = async (id: string): Promise<{ ok: boolean; user: User }> => {
   const { data } = await FamilyApi.get<{ ok: boolean; user: User }>(`/auth/users/${id}`);
   return data;
}

export const changePassword = async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }) => {
   const { data } = await FamilyApi.put('/auth/change-password', { currentPassword, newPassword });
   return data;
}
