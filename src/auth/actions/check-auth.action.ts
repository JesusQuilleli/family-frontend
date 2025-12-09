import { FamilyApi } from "@/api/family.api";
import type { AuthResponse } from "../interfaces/check-auth.response";

export const checkAuthAction = async (): Promise<AuthResponse> => {
   const token = localStorage.getItem("token");
   if (!token) throw new Error("No token found");

   try {
      const { data } = await FamilyApi.get<AuthResponse>("/auth/renew");

      localStorage.setItem("token", data.token);

      return data;

   } catch (error) {
      localStorage.removeItem("token");
      throw new Error("Token expired or not valid");
   }
};
