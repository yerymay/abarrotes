import { createServerFn } from "@tanstack/react-start";
import { requireAdmin, requireAuth } from "@/modules/auth/auth.middleware.server";
import { parseCategoryName, parseProduct } from "./catalog.schema";
import type { Category, Product, ProductWithCategory } from "./catalog.schema";
import {
  createCategory as createCategoryService,
  getActiveProducts,
  getAllProducts,
  getCategories,
  saveProduct as saveProductService,
} from "./catalog.service.server";

export const listActiveProducts = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler((): Promise<Product[]> => getActiveProducts());

export const listAllProducts = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler((): Promise<ProductWithCategory[]> => getAllProducts());

export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler((): Promise<Category[]> => getCategories());

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator(parseProduct)
  .handler(({ data }) => saveProductService(data));

export const createCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator(parseCategoryName)
  .handler(({ data }) => createCategoryService(data.name));
