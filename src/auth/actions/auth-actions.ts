import axios from "axios";
import { FamilyApi } from "@/api/family.api";

interface ApiError {
   msg: string;
   ok: boolean;
}

export const forgotPasswordAction = async (email: string): Promise<any> => {
   try {
      const { data } = await FamilyApi.post("/auth/forgot-password", { email });
      return data;
   } catch (error: any) {
      if (axios.isAxiosError(error)) {
         const backendError = error.response?.data as ApiError;
         if (backendError && backendError.msg) {
            throw new Error(backendError.msg);
         }
      }
      throw new Error("Error al enviar correo de recuperación");
   }
};

export const resetPasswordAction = async (token: string, password: string): Promise<any> => {
   try {
      const { data } = await FamilyApi.post(`/auth/reset-password/${token}`, { password });
      return data;
   } catch (error: any) {
      if (axios.isAxiosError(error)) {
         const backendError = error.response?.data as ApiError;
         if (backendError && backendError.msg) {
            throw new Error(backendError.msg);
         }
      }
      throw new Error("Error al restablecer contraseña");
   }
};
export const updateProfileAction = async (data: { name?: string; email?: string; phone?: string }): Promise<any> => {
   try {
      const response = await FamilyApi.put("/auth/profile", data);
      return response.data;
   } catch (error: any) {
      if (axios.isAxiosError(error)) {
         const backendError = error.response?.data as ApiError;
         if (backendError && backendError.msg) {
            throw new Error(backendError.msg);
         }
      }
      throw new Error("Error al actualizar perfil");
   }
};

export const deleteAccountAction = async (): Promise<any> => {
   try {
      const response = await FamilyApi.delete("/auth/profile");
      return response.data;
   } catch (error: any) {
      if (axios.isAxiosError(error)) {
         const backendError = error.response?.data as ApiError;
         if (backendError && backendError.msg) {
            throw new Error(backendError.msg);
         }
      }
      throw new Error("Error al eliminar cuenta");
   }
};
