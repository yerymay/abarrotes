import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSaleItems, listSales } from "@/modules/sales/sales.functions";
import { fecha, soles } from "@/shared/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SalesPage() {
  const [open, setOpen] = useState<string | null>(null);
  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => listSales(),
  });
  const sel = sales.find((s) => s.id === open);
  const { data: items = [] } = useQuery({
    queryKey: ["sale_items", open],
    enabled: !!open,
    queryFn: () => listSaleItems({ data: { sale_id: open! } }),
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Ventas</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">N°</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Pago</th>
              <th className="p-3 text-right">IGV</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer border-t hover:bg-muted/50"
                onClick={() => setOpen(s.id)}
              >
                <td className="p-3 font-semibold">#{String(s.number).padStart(6, "0")}</td>
                <td className="p-3 text-muted-foreground">{fecha(s.created_at)}</td>
                <td className="p-3 capitalize">{s.payment_method}</td>
                <td className="p-3 text-right tabular">{soles(s.igv)}</td>
                <td className="p-3 text-right font-bold tabular">{soles(s.total)}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Aún no hay ventas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Venta #{sel && String(sel.number).padStart(6, "0")}</DialogTitle>
          </DialogHeader>
          {sel && (
            <div className="space-y-1 text-sm">
              <div className="text-muted-foreground">
                {fecha(sel.created_at)} · <span className="capitalize">{sel.payment_method}</span>
              </div>
              <div className="my-3 space-y-1 border-y py-3">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>
                      {Number(i.quantity)} × {i.name}
                    </span>
                    <span className="tabular">{soles(i.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <span>Op. gravada</span>
                <span className="tabular">{soles(sel.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGV 18%</span>
                <span className="tabular">{soles(sel.igv)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="tabular">{soles(sel.total)}</span>
              </div>
              {sel.cash_received != null && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Recibido / Vuelto</span>
                  <span className="tabular">
                    {soles(sel.cash_received)} / {soles(sel.change_given)}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
