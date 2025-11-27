import { FamilyApi } from "@/api/family.api";

interface ValidateResponse {
   ok: boolean;
   valid: boolean;
   adminName?: string;
}

export const validateReferralCodeAction = async (code: string): Promise<{ valid: boolean; adminName?: string }> => {
   try {
      const { data } = await FamilyApi.get<ValidateResponse>(`/referral/validate/${code}`);
      return {
         valid: data.valid,
         adminName: data.adminName
      };
   } catch (error) {
      return {
         valid: false
      };
   }
};
