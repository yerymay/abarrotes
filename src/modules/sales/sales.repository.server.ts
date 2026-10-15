import type { RowDataPacket } from "mysql2/promise";
import { query, type PoolConnection } from "@/core/db.server";
import type { Sale, SaleItem } from "./sales.schema";

export type LockedProduct = RowDataPacket & {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export function listSales(): Promise<Sale[]> {
  return query<Sale>("SELECT * FROM sales ORDER BY created_at DESC LIMIT 100");
}

export function listSaleItems(saleId: string): Promise<SaleItem[]> {
  return query<SaleItem>("SELECT * FROM sale_items WHERE sale_id = ?", [saleId]);
}

export async function findProductForUpdate(
  conn: PoolConnection,
  productId: string,
): Promise<LockedProduct | undefined> {
  const [rows] = await conn.query<LockedProduct[]>(
    "SELECT id, name, price, stock FROM products WHERE id = ? AND active = 1 FOR UPDATE",
    [productId],
  );
  return rows[0];
}

export async function decrementStock(
  conn: PoolConnection,
  params: { productId: string; quantity: number },
): Promise<void> {
  await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
    params.quantity,
    params.productId,
  ]);
}

export async function insertSale(
  conn: PoolConnection,
  params: {
    id: string;
    userId: string;
    subtotal: number;
    igv: number;
    total: number;
    paymentMethod: string;
    cashReceived: number | null;
    changeGiven: number | null;
  },
): Promise<void> {
  await conn.query(
    `INSERT INTO sales
       (id, user_id, subtotal, igv, total, payment_method, cash_received, change_given)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.userId,
      params.subtotal,
      params.igv,
      params.total,
      params.paymentMethod,
      params.cashReceived,
      params.changeGiven,
    ],
  );
}

export async function insertSaleItem(
  conn: PoolConnection,
  params: {
    saleId: string;
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  },
): Promise<void> {
  await conn.query(
    `INSERT INTO sale_items
       (id, sale_id, product_id, name, quantity, unit_price, line_total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      params.saleId,
      params.productId,
      params.name,
      params.quantity,
      params.unitPrice,
      params.lineTotal,
    ],
  );
}

export async function insertSaleMovement(
  conn: PoolConnection,
  params: { productId: string; userId: string; quantity: number },
): Promise<void> {
  await conn.query(
    "INSERT INTO stock_movements (id, product_id, user_id, type, quantity, note) VALUES (?, ?, ?, ?, ?, ?)",
    [crypto.randomUUID(), params.productId, params.userId, "venta", -params.quantity, "Venta"],
  );
}
