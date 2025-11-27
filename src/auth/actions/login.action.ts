import axios from "axios";
import type { UserResponse } from "../interfaces/user.response";
import { FamilyApi } from "@/api/family.api";

interface ApiError {
   msg: string;
   ok: boolean;
}

export const loginAction = async (
   email: string,
   password: string
): Promise<UserResponse> => {
   try {
      const { data } = await FamilyApi.post<UserResponse>("/auth/login", {
         email,
         password,
      });

      return data;

   } catch (error: any) {
      //console.log(error); // Mantén esto para depurar

      if (axios.isAxiosError(error)) {

         const backendError = error.response?.data as ApiError;

         if (backendError && backendError.msg) {
            throw new Error(backendError.msg);
         }
      }

      throw new Error("Un error inesperado ha ocurrido.");
   }
};
