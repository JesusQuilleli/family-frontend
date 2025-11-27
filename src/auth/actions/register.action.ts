import { FamilyApi } from "@/api/family.api";
import type { UserResponse } from "../interfaces/user.response";

export const registerAction = async (
   fullName: string,
   email: string,
   password: string,
   phone: string,
   referralCode?: string
): Promise<UserResponse> => {
   try {
      const { data } = await FamilyApi.post<UserResponse>("/auth/new/", {
         name: fullName,
         email,
         password,
         phone,
         referralCode
      });

      return data;
   } catch (error) {
      console.log(error);
      throw error;
   }
};