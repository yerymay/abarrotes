import { createFileRoute } from "@tanstack/react-router";
import { SalesPage } from "@/modules/sales/components/SalesPage";

export const Route = createFileRoute("/_authenticated/ventas")({
  head: () => ({
    meta: [
      { title: "Ventas — Bodega POS" },
      { name: "description", content: "Historial de ventas." },
    ],
  }),
  component: SalesPage,
});
