import { query } from "@/core/db.server";
import type { DashboardProduct, DashboardSale, DashboardTopItem } from "./dashboard.schema";

export function listTodaySales(): Promise<DashboardSale[]> {
  return query<DashboardSale>(
    "SELECT total, payment_method FROM sales WHERE DATE(created_at) = CURDATE()",
  );
}

export function listActiveProductsStock(): Promise<DashboardProduct[]> {
  return query<DashboardProduct>(
    "SELECT id, name, stock, min_stock FROM products WHERE active = 1",
  );
}

export function listTopItemsToday(): Promise<DashboardTopItem[]> {
  return query<DashboardTopItem>(
    `SELECT si.name AS name, SUM(si.quantity) AS quantity
     FROM sale_items si
     JOIN sales s ON s.id = si.sale_id
     WHERE DATE(s.created_at) = CURDATE()
     GROUP BY si.name
     ORDER BY quantity DESC
     LIMIT 5`,
  );
}
