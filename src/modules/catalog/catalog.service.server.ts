import {
  insertCategory,
  insertProduct,
  listActiveProducts,
  listAllProducts,
  listCategories,
  updateProduct,
} from "./catalog.repository.server";
import type { Category, Product, ProductInput, ProductWithCategory } from "./catalog.schema";

export function getActiveProducts(): Promise<Product[]> {
  return listActiveProducts();
}

export function getAllProducts(): Promise<ProductWithCategory[]> {
  return listAllProducts();
}

export function getCategories(): Promise<Category[]> {
  return listCategories();
}

export async function saveProduct(input: ProductInput) {
  if (input.id) {
    await updateProduct({ ...input, id: input.id });
    return { ok: true as const, id: input.id };
  }
  const id = crypto.randomUUID();
  await insertProduct({ ...input, id });
  return { ok: true as const, id };
}

export async function createCategory(name: string) {
  await insertCategory(name);
  return { ok: true as const };
}
