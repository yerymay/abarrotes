export type Product = {
  id: string;
  name: string;
  barcode: string | null;
  category_id: string | null;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  active: number;
};

export type ProductWithCategory = Product & { category_name: string | null };
export type Category = { id: string; name: string };

export type ProductInput = {
  id: string | null;
  name: string;
  barcode: string | null;
  category_id: string | null;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  active: number;
};

export function parseProduct(data: unknown): ProductInput {
  if (typeof data !== "object" || data === null) {
    throw new Error("Datos inválidos");
  }
  const d = data as Record<string, unknown>;
  const toNum = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
  const name = typeof d["name"] === "string" ? d["name"].trim() : "";
  if (!name) throw new Error("El nombre es obligatorio");
  return {
    id: typeof d["id"] === "string" && d["id"] ? d["id"] : null,
    name,
    barcode: typeof d["barcode"] === "string" && d["barcode"].trim() ? d["barcode"].trim() : null,
    category_id: typeof d["category_id"] === "string" && d["category_id"] ? d["category_id"] : null,
    unit: typeof d["unit"] === "string" && d["unit"].trim() ? d["unit"].trim() : "und",
    price: toNum(d["price"]),
    cost: toNum(d["cost"]),
    stock: toNum(d["stock"]),
    min_stock: toNum(d["min_stock"]),
    active: toNum(d["active"]) ? 1 : 0,
  };
}

export function parseCategoryName(data: unknown): { name: string } {
  const name =
    typeof data === "object" && data !== null
      ? String((data as Record<string, unknown>)["name"] ?? "").trim()
      : "";
  if (!name) throw new Error("El nombre es obligatorio");
  return { name };
}
