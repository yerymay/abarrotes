export type DashboardSale = { total: number; payment_method: string };
export type DashboardProduct = { id: string; name: string; stock: number; min_stock: number };
export type DashboardTopItem = { name: string; quantity: number };

export type DashboardData = {
  total: number;
  count: number;
  byMethod: Record<string, number>;
  low: DashboardProduct[];
  topList: [string, number][];
};
