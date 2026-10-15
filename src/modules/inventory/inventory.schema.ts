export type Movement = {
  id: string;
  product_id: string;
  user_id: string;
  type: string;
  quantity: number;
  note: string | null;
  created_at: string;
  product_name: string | null;
};

export type AdjustInput = {
  product_id: string;
  quantity: number;
  type: string;
  note: string | null;
};

export function parseAdjust(data: unknown): AdjustInput {
  if (typeof data !== "object" || data === null) {
    throw new Error("Datos inválidos");
  }
  const d = data as Record<string, unknown>;
  const product_id = typeof d["_product_id"] === "string" ? d["_product_id"] : "";
  const quantity = Number(d["_quantity"]);
  if (!product_id || !Number.isFinite(quantity) || quantity === 0) {
    throw new Error("Producto y cantidad son obligatorios");
  }
  return {
    product_id,
    quantity,
    type: typeof d["_type"] === "string" && d["_type"] ? d["_type"] : "ajuste",
    note: typeof d["_note"] === "string" ? d["_note"] : null,
  };
}
