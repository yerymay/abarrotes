import { createFileRoute } from "@tanstack/react-router";
import { PosPage } from "@/modules/sales/components/PosPage";

export const Route = createFileRoute("/_authenticated/pos")({
  head: () => ({
    meta: [{ title: "Caja — Bodega POS" }, { name: "description", content: "Punto de venta." }],
  }),
  component: PosPage,
});
