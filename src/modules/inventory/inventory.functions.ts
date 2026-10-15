import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "@/modules/auth/auth.middleware.server";
import { parseAdjust } from "./inventory.schema";
import type { Movement } from "./inventory.schema";
import { adjustStock as adjustStockService, getMovements } from "./inventory.service.server";

export const listMovements = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler((): Promise<Movement[]> => getMovements());

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator(parseAdjust)
  .handler(({ data, context }) => adjustStockService(data, context.user.id));
