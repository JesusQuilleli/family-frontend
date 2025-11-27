import { FamilyApi } from "@/api/family.api";

export interface ReferralCodeData {
   code: string;
   usedCount: number;
   createdAt: string;
   expiresAt?: string;
}

interface ReferralCodeResponse {
   ok: boolean;
   code: string;
   usedCount: number;
   createdAt: string;
   expiresAt?: string;
}

export const getMyReferralCodeAction = async (): Promise<ReferralCodeData> => {
   try {
      const { data } = await FamilyApi.get<ReferralCodeResponse>('/referral/my-code');
      return {
         code: data.code,
         usedCount: data.usedCount,
         createdAt: data.createdAt,
         expiresAt: data.expiresAt
      };
   } catch (error) {
      console.error(error);
      throw new Error("No se pudo obtener el código de referido");
   }
};
