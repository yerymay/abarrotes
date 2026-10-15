import { query } from "@/core/db.server";
import type { Category, Product, ProductInput, ProductWithCategory } from "./catalog.schema";

export function listActiveProducts(): Promise<Product[]> {
  return query<Product>(
    "SELECT id, name, barcode, category_id, unit, price, cost, stock, min_stock, active FROM products WHERE active = 1 ORDER BY name",
  );
}

export function listAllProducts(): Promise<ProductWithCategory[]> {
  return query<ProductWithCategory>(
    `SELECT p.id, p.name, p.barcode, p.category_id, p.unit, p.price, p.cost,
            p.stock, p.min_stock, p.active, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.name`,
  );
}

export function listCategories(): Promise<Category[]> {
  return query<Category>("SELECT id, name FROM categories ORDER BY name");
}

export async function updateProduct(input: ProductInput & { id: string }): Promise<void> {
  await query(
    `UPDATE products
       SET name = ?, barcode = ?, category_id = ?, unit = ?, price = ?, cost = ?,
           stock = ?, min_stock = ?, active = ?
     WHERE id = ?`,
    [
      input.name,
      input.barcode,
      input.category_id,
      input.unit,
      input.price,
      input.cost,
      input.stock,
      input.min_stock,
      input.active,
      input.id,
    ],
  );
}

export async function insertProduct(input: ProductInput & { id: string }): Promise<void> {
  await query(
    `INSERT INTO products
       (id, name, barcode, category_id, unit, price, cost, stock, min_stock, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id,
      input.name,
      input.barcode,
      input.category_id,
      input.unit,
      input.price,
      input.cost,
      input.stock,
      input.min_stock,
      input.active,
    ],
  );
}

export async function insertCategory(name: string): Promise<void> {
  await query("INSERT INTO categories (id, name) VALUES (?, ?)", [crypto.randomUUID(), name]);
}
