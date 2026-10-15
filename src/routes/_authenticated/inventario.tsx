import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/modules/inventory/components/InventoryPage";

export const Route = createFileRoute("/_authenticated/inventario")({
  head: () => ({
    meta: [
      { title: "Inventario — Bodega POS" },
      { name: "description", content: "Stock y movimientos." },
    ],
  }),
  component: InventoryPage,
});
