import { withTransaction } from "@/core/db.server";
import {
  decrementStock,
  findProductForUpdate,
  insertSale,
  insertSaleItem,
  insertSaleMovement,
  listSaleItems,
  listSales,
} from "./sales.repository.server";
import type { Sale, SaleInput, SaleItem } from "./sales.schema";

const round = (n: number) => Math.round(n * 100) / 100;

export function getSales(): Promise<Sale[]> {
  return listSales();
}

export function getSaleItems(saleId: string): Promise<SaleItem[]> {
  return listSaleItems(saleId);
}

export async function createSale(input: SaleInput, userId: string) {
  const saleId = await withTransaction(async (conn) => {
    let total = 0;
    const resolved: { productId: string; name: string; quantity: number; price: number }[] = [];

    for (const item of input.items) {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        throw new Error("Cantidad inválida");
      }
      const product = await findProductForUpdate(conn, item.product_id);
      if (!product) throw new Error("Producto no encontrado");
      if (Number(product.stock) < item.quantity) {
        throw new Error(`Stock insuficiente: ${product.name}`);
      }
      resolved.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: Number(product.price),
      });
      total += round(Number(product.price) * item.quantity);
    }

    if (input.payment_method === "efectivo" && (input.cash_received ?? 0) < total) {
      throw new Error("Efectivo insuficiente");
    }

    const subtotal = round(total / 1.18);
    const igv = round(total - subtotal);
    const cashReceived = input.payment_method === "efectivo" ? input.cash_received : null;
    const changeGiven =
      input.payment_method === "efectivo" ? round((input.cash_received ?? 0) - total) : null;

    const id = crypto.randomUUID();
    await insertSale(conn, {
      id,
      userId,
      subtotal,
      igv,
      total,
      paymentMethod: input.payment_method,
      cashReceived,
      changeGiven,
    });

    for (const line of resolved) {
      await decrementStock(conn, { productId: line.productId, quantity: line.quantity });
      await insertSaleItem(conn, {
        saleId: id,
        productId: line.productId,
        name: line.name,
        quantity: line.quantity,
        unitPrice: line.price,
        lineTotal: round(line.price * line.quantity),
      });
      await insertSaleMovement(conn, {
        productId: line.productId,
        userId,
        quantity: line.quantity,
      });
    }

    return id;
  });

  return { ok: true as const, id: saleId };
}
