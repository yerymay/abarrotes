import { query, type PoolConnection } from "@/core/db.server";
import type { Movement } from "./inventory.schema";

export function listMovements(): Promise<Movement[]> {
  return query<Movement>(
    `SELECT m.id, m.product_id, m.user_id, m.type, m.quantity, m.note,
            m.created_at, p.name AS product_name
     FROM stock_movements m
     LEFT JOIN products p ON p.id = m.product_id
     ORDER BY m.created_at DESC
     LIMIT 50`,
  );
}

export async function applyStockDelta(
  conn: PoolConnection,
  params: { productId: string; quantity: number },
): Promise<void> {
  await conn.query("UPDATE products SET stock = stock + ? WHERE id = ?", [
    params.quantity,
    params.productId,
  ]);
}

export async function insertMovement(
  conn: PoolConnection,
  params: {
    productId: string;
    userId: string;
    type: string;
    quantity: number;
    note: string | null;
  },
): Promise<void> {
  await conn.query(
    "INSERT INTO stock_movements (id, product_id, user_id, type, quantity, note) VALUES (?, ?, ?, ?, ?, ?)",
    [
      crypto.randomUUID(),
      params.productId,
      params.userId,
      params.type,
      params.quantity,
      params.note,
    ],
  );
}
