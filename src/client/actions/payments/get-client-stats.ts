import { FamilyApi } from "@/api/family.api";

export interface PaymentStats {
   totalPayments: number;
   verifiedAmount: number;
   pendingAmount: number;
}

interface StatsResponse {
   ok: boolean;
   stats: PaymentStats;
}

export const getClientPaymentsStatsAction = async (): Promise<PaymentStats> => {
   try {
      const { data } = await FamilyApi.get<StatsResponse>('/payments/client/stats');
      return data.stats;
   } catch (error) {
      console.error(error);
      throw new Error("No se pudieron obtener las estadísticas");
   }
};
