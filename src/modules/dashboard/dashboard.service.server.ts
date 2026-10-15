import {
  listActiveProductsStock,
  listTodaySales,
  listTopItemsToday,
} from "./dashboard.repository.server";
import type { DashboardData } from "./dashboard.schema";

export async function getDashboard(): Promise<DashboardData> {
  const [sales, products, items] = await Promise.all([
    listTodaySales(),
    listActiveProductsStock(),
    listTopItemsToday(),
  ]);

  const total = sales.reduce((acc, s) => acc + Number(s.total), 0);
  const byMethod: Record<string, number> = {};
  for (const s of sales) {
    byMethod[s.payment_method] = (byMethod[s.payment_method] ?? 0) + Number(s.total);
  }
  const low = products.filter((p) => Number(p.stock) <= Number(p.min_stock));
  const topList = items.map((i) => [i.name, Number(i.quantity)] as [string, number]);

  return { total, count: sales.length, byMethod, low, topList };
}
