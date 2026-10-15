import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/modules/auth/auth.middleware.server";
import { parseSale, parseSaleId } from "./sales.schema";
import type { Sale, SaleItem } from "./sales.schema";
import { createSale as createSaleService, getSaleItems, getSales } from "./sales.service.server";

export const listSales = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler((): Promise<Sale[]> => getSales());

export const listSaleItems = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator(parseSaleId)
  .handler(({ data }): Promise<SaleItem[]> => getSaleItems(data.saleId));

export const createSale = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(parseSale)
  .handler(({ data, context }) => createSaleService(data, context.user.id));
