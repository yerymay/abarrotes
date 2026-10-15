import { withTransaction } from "@/core/db.server";
import { applyStockDelta, insertMovement, listMovements } from "./inventory.repository.server";
import type { AdjustInput, Movement } from "./inventory.schema";

export function getMovements(): Promise<Movement[]> {
  return listMovements();
}

export async function adjustStock(input: AdjustInput, userId: string) {
  await withTransaction(async (conn) => {
    await applyStockDelta(conn, { productId: input.product_id, quantity: input.quantity });
    await insertMovement(conn, {
      productId: input.product_id,
      userId,
      type: input.type,
      quantity: input.quantity,
      note: input.note,
    });
  });
  return { ok: true as const };
}
