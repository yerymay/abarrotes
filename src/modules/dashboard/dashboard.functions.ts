import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/modules/auth/auth.middleware.server";
import type { DashboardData } from "./dashboard.schema";
import { getDashboard as getDashboardService } from "./dashboard.service.server";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler((): Promise<DashboardData> => getDashboardService());
