export type Sale = {
  id: string;
  number: number;
  user_id: string;
  subtotal: number;
  igv: number;
  total: number;
  payment_method: string;
  cash_received: number | null;
  change_given: number | null;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type CartItem = { product_id: string; quantity: number };

export type SaleInput = {
  items: CartItem[];
  payment_method: string;
  cash_received: number | null;
};

export function parseSale(data: unknown): SaleInput {
  if (typeof data !== "object" || data === null) {
    throw new Error("Datos inválidos");
  }
  const d = data as Record<string, unknown>;
  const rawItems = Array.isArray(d["_items"]) ? d["_items"] : [];
  const items: CartItem[] = rawItems.map((it) => {
    const row = it as Record<string, unknown>;
    return {
      product_id: String(row["product_id"] ?? ""),
      quantity: Number(row["quantity"]),
    };
  });
  if (items.length === 0) throw new Error("Carrito vacío");
  const payment_method =
    typeof d["_payment_method"] === "string" ? d["_payment_method"] : "efectivo";
  const cash =
    d["_cash_received"] === null || d["_cash_received"] === undefined
      ? null
      : Number(d["_cash_received"]);
  return { items, payment_method, cash_received: cash };
}

export function parseSaleId(data: unknown): { saleId: string } {
  const saleId =
    typeof data === "object" && data !== null
      ? String((data as Record<string, unknown>)["sale_id"] ?? "")
      : "";
  if (!saleId) throw new Error("Producto y venta son obligatorios");
  return { saleId };
}
