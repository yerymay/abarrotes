import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/modules/catalog/components/ProductsPage";

export const Route = createFileRoute("/_authenticated/productos")({
  head: () => ({
    meta: [
      { title: "Productos — Bodega POS" },
      { name: "description", content: "Catálogo de productos." },
    ],
  }),
  component: ProductsPage,
});
