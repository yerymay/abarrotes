import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanBarcode, Package, BarChart3, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bodega POS — Vende rápido, controla tu stock" },
      {
        name: "description",
        content:
          "Punto de venta, catálogo e inventario en soles para bodegas y tiendas de abarrotes en Perú.",
      },
      { property: "og:title", content: "Bodega POS — Vende rápido, controla tu stock" },
      {
        property: "og:description",
        content: "Punto de venta, catálogo e inventario en soles para bodegas en Perú.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: ScanBarcode, t: "Caja veloz", d: "Escanea o busca, cobra en efectivo, Yape o tarjeta." },
  { icon: Package, t: "Catálogo", d: "Productos, categorías, precios y códigos de barra." },
  { icon: BarChart3, t: "Inventario", d: "Alertas de stock bajo y ajustes con historial." },
  { icon: Receipt, t: "Ventas", d: "Historial con IGV incluido y resumen del día." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-extrabold text-primary">
          bodega<span className="text-accent-foreground">.pos</span>
        </span>
        <Button asChild variant="outline">
          <Link to="/auth">Ingresar</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            Hecho para bodegas peruanas
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] md:text-7xl">
            Vende rápido.
            <br />
            Que no te falte <span className="text-primary">nada</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Caja, catálogo e inventario en un solo lugar. Precios en soles con IGV incluido.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Empezar gratis</Link>
            </Button>
          </div>
        </div>
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="rounded-xl border bg-card p-6 shadow-soft">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
