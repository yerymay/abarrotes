import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/modules/dashboard/components/DashboardPage";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Resumen — Bodega POS" }, { name: "description", content: "Resumen del día." }],
  }),
  component: DashboardPage,
});
