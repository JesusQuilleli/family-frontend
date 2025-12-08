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
      tasaCopToBs?: number;
      adminViewPreference?: 'USD_TO_BS' | 'COP_TO_BS';
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
   deleted?: boolean;
   deletedAt?: string;
   deletionRequested?: boolean;
   deletionReason?: string;
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

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
   const { data } = await FamilyApi.put<ProfileResponse>('/auth/profile', userData);
   return data.user;
}

export const getAllUsers = async (page = 1, limit = 10, search = '', deleted = false): Promise<UsersResponse> => {
   const { data } = await FamilyApi.get<UsersResponse>(`/auth/users?page=${page}&limit=${limit}&search=${search}&deleted=${deleted}`);
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
