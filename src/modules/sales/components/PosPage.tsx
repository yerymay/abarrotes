import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, Trash2, Search } from "lucide-react";
import { listActiveProducts, listCategories } from "@/modules/catalog/catalog.functions";
import { createSale } from "@/modules/sales/sales.functions";
import { soles } from "@/shared/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Product = {
  id: string;
  name: string;
  barcode: string | null;
  price: number;
  stock: number;
  category_id: string | null;
};
type Line = { product: Product; qty: number };

export function PosPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [cart, setCart] = useState<Line[]>([]);
  const [method, setMethod] = useState<"efectivo" | "yape" | "tarjeta">("efectivo");
  const [cash, setCash] = useState("");
  const [busy, setBusy] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: async () => {
      const data = await listActiveProducts();
      return data as Product[];
    },
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return products.filter(
      (p) =>
        (!cat || p.category_id === cat) &&
        (!s || p.name.toLowerCase().includes(s) || p.barcode?.includes(s)),
    );
  }, [products, q, cat]);

  const total = cart.reduce((a, l) => a + l.product.price * l.qty, 0);
  const change = Number(cash || 0) - total;

  function add(p: Product) {
    setCart((c) => {
      const ex = c.find((l) => l.product.id === p.id);
      const current = ex?.qty ?? 0;
      if (current + 1 > p.stock) {
        toast.error(`Sin stock suficiente de ${p.name}`);
        return c;
      }
      return ex
        ? c.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l))
        : [...c, { product: p, qty: 1 }];
    });
  }
  function setQty(id: string, qty: number) {
    setCart((c) =>
      c.flatMap((l) =>
        l.product.id !== id ? [l] : qty <= 0 ? [] : [{ ...l, qty: Math.min(qty, l.product.stock) }],
      ),
    );
  }

  function onSearchEnter(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    const exact = products.find((p) => p.barcode && p.barcode === q.trim());
    const pick = exact ?? (filtered.length === 1 ? filtered[0] : null);
    if (pick) {
      add(pick);
      setQ("");
    }
  }

  async function checkout() {
    if (!cart.length) return;
    setBusy(true);
    try {
      await createSale({
        data: {
          _items: cart.map((l) => ({ product_id: l.product.id, quantity: l.qty })),
          _payment_method: method,
          _cash_received: method === "efectivo" ? Number(cash || 0) : null,
        },
      });
      toast.success(
        method === "efectivo" && change > 0
          ? `Venta registrada. Vuelto: ${soles(change)}`
          : "Venta registrada",
      );
      setCart([]);
      setCash("");
      qc.invalidateQueries();
      searchRef.current?.focus();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onSearchEnter}
            placeholder="Escanea el código o busca un producto…"
            className="h-12 pl-10 text-base"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={cat === null ? "default" : "outline"}
            onClick={() => setCat(null)}
          >
            Todos
          </Button>
          {cats.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={cat === c.id ? "default" : "outline"}
              onClick={() => setCat(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => add(p)}
              disabled={p.stock <= 0}
              className="rounded-xl border bg-card p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary disabled:opacity-40"
            >
              <div className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold">{p.name}</div>
              <div className="mt-2 font-display text-xl font-bold text-primary tabular">
                {soles(p.price)}
              </div>
              <div className="text-xs text-muted-foreground">Stock: {Number(p.stock)}</div>
            </button>
          ))}
        </div>
      </section>

      <aside className="flex h-fit flex-col rounded-2xl border bg-card p-5 shadow-soft lg:sticky lg:top-8">
        <h2 className="text-lg font-bold">Venta actual</h2>
        <div className="mt-3 max-h-[40vh] flex-1 space-y-2 overflow-y-auto">
          {cart.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Agrega productos para empezar
            </p>
          )}
          {cart.map((l) => (
            <div key={l.product.id} className="flex items-center gap-2 rounded-lg bg-muted p-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{l.product.name}</div>
                <div className="text-xs text-muted-foreground tabular">
                  {soles(l.product.price)} × {l.qty}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setQty(l.product.id, l.qty - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-bold tabular">{l.qty}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setQty(l.product.id, l.qty + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive"
                onClick={() => setQty(l.product.id, 0)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Op. gravada</span>
            <span className="tabular">{soles(total / 1.18)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>IGV (18%)</span>
            <span className="tabular">{soles(total - total / 1.18)}</span>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <span className="font-bold">Total</span>
            <span className="font-display text-3xl font-extrabold tabular">{soles(total)}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["efectivo", "yape", "tarjeta"] as const).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={method === m ? "default" : "outline"}
              onClick={() => setMethod(m)}
              className="capitalize"
            >
              {m}
            </Button>
          ))}
        </div>
        {method === "efectivo" && (
          <div className="mt-3">
            <Input
              type="number"
              step="0.10"
              inputMode="decimal"
              placeholder="Monto recibido"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
            />
            {cash && (
              <div
                className={`mt-1 text-sm font-semibold ${change < 0 ? "text-destructive" : "text-success"}`}
              >
                {change < 0 ? "Falta " + soles(-change) : "Vuelto " + soles(change)}
              </div>
            )}
          </div>
        )}
        <Button
          size="lg"
          className="mt-4 h-12 text-base"
          disabled={!cart.length || busy || (method === "efectivo" && change < 0)}
          onClick={checkout}
        >
          Cobrar {soles(total)}
        </Button>
      </aside>
    </div>
  );
}
