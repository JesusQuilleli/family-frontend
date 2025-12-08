import { FamilyApi } from "@/api/family.api";

export interface GeneralStats {
   totalIncome: number;
   totalSalesValue: number;
   totalCost: number;
   netProfit: number;
   ordersCount: number;
}

export interface ChartDataPoint {
   date: string;
   sales: number;
   profit: number;
}

export interface Transaction {
   date: string;
   orderId: string;
   client: string;
   total: number;
   cost: number;
   profit: number;
   status: string;
}

export const getGeneralStatsAction = async (): Promise<GeneralStats> => {
   const { data } = await FamilyApi.get<{ ok: boolean; stats: GeneralStats }>('/reports/stats');
   return data.stats;
}

export const getSalesChartAction = async (period: 'day' | 'week' | 'month' = 'month'): Promise<ChartDataPoint[]> => {
   const { data } = await FamilyApi.get<{ ok: boolean; chartData: ChartDataPoint[] }>(`/reports/chart?period=${period}`);
   return data.chartData;
}

export const getTransactionsReportAction = async (startDate?: string, endDate?: string): Promise<Transaction[]> => {
   let query = '';
   if (startDate && endDate) {
      query = `?startDate=${startDate}&endDate=${endDate}`;
   }
   const { data } = await FamilyApi.get<{ ok: boolean; report: Transaction[] }>(`/reports/transactions${query}`);
   return data.report;
}
