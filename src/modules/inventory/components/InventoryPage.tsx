import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listAllProducts } from "@/modules/catalog/catalog.functions";
import { adjustStock, listMovements } from "@/modules/inventory/inventory.functions";
import { fecha } from "@/shared/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InventoryPage() {
  const qc = useQueryClient();
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("compra");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products", "all-inv"],
    queryFn: () => listAllProducts(),
  });
  const { data: moves = [] } = useQuery({
    queryKey: ["movements"],
    queryFn: () => listMovements(),
  });

  async function submit() {
    const n = Number(qty);
    if (!productId || !n) return;
    const signed = type === "merma" ? -Math.abs(n) : type === "compra" ? Math.abs(n) : n;
    try {
      await adjustStock({
        data: { _product_id: productId, _quantity: signed, _type: type, _note: note },
      });
      toast.success("Stock actualizado");
      setQty("");
      setNote("");
      qc.invalidateQueries();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const low = products.filter((p) => Number(p.stock) <= Number(p.min_stock));

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Inventario</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="font-bold">Registrar movimiento</h2>
            <div>
              <Label>Producto</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({Number(p.stock)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">Compra / ingreso</SelectItem>
                  <SelectItem value="merma">Merma / pérdida</SelectItem>
                  <SelectItem value="ajuste">Ajuste (+/−)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div>
              <Label>Nota</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Proveedor, motivo…"
              />
            </div>
            <Button className="w-full" onClick={submit}>
              Guardar
            </Button>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="mb-3 font-bold">Por reponer ({low.length})</h2>
            {low.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todo en orden</p>
            ) : (
              low.map((p) => (
                <div key={p.id} className="flex justify-between py-1 text-sm">
                  <span>{p.name}</span>
                  <span className="font-bold text-destructive tabular">
                    {Number(p.stock)} / {Number(p.min_stock)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Tipo</th>
                <th className="p-3 text-right">Cant.</th>
                <th className="p-3">Nota</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3 text-muted-foreground">{fecha(m.created_at)}</td>
                  <td className="p-3 font-semibold">{m.product_name}</td>
                  <td className="p-3 capitalize">{m.type}</td>
                  <td
                    className={`p-3 text-right font-bold tabular ${Number(m.quantity) < 0 ? "text-destructive" : "text-success"}`}
                  >
                    {Number(m.quantity) > 0 ? "+" : ""}
                    {Number(m.quantity)}
                  </td>
                  <td className="p-3 text-muted-foreground">{m.note}</td>
                </tr>
              ))}
              {moves.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Sin movimientos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
