import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const FamilyApi = axios.create({
   baseURL: import.meta.env.VITE_API_URL
});

FamilyApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
   const token = localStorage.getItem("token");

   if (token) {
      config.headers['x-token'] = token;
   }

   return config;
});

export const checkBackendHealth = async () => {
   try {
      await FamilyApi.get('/test');
      return true;
   } catch (error) {
      return false;
   }
}

export { FamilyApi };