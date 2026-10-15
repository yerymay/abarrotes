import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import {
  createCategory,
  listAllProducts,
  listCategories,
  saveProduct,
} from "@/modules/catalog/catalog.functions";
import { soles } from "@/shared/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type P = {
  id?: string;
  name: string;
  barcode: string | null;
  category_id: string | null;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  active: boolean;
};
const empty: P = {
  name: "",
  barcode: "",
  category_id: null,
  unit: "und",
  price: 0,
  cost: 0,
  stock: 0,
  min_stock: 0,
  active: true,
};

export function ProductsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<P | null>(null);
  const [newCat, setNewCat] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => listAllProducts(),
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const list = products.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.barcode?.includes(q),
  );

  async function save() {
    if (!edit) return;
    const { id, ...rest } = edit;
    const payload = { ...rest, barcode: rest.barcode || null };
    try {
      await saveProduct({ data: { ...payload, id: id ?? null } });
      toast.success("Producto guardado");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function addCat() {
    if (!newCat.trim()) return;
    try {
      await createCategory({ data: { name: newCat.trim() } });
      setNewCat("");
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Productos</h1>
        <Button onClick={() => setEdit({ ...empty })}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="Buscar…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-2">
          <Input
            className="w-44"
            placeholder="Nueva categoría"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
          />
          <Button variant="outline" onClick={addCat}>
            Agregar
          </Button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Categoría</th>
              <th className="p-3 text-right">Costo</th>
              <th className="p-3 text-right">Precio</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className={`border-t ${p.active ? "" : "opacity-50"}`}>
                <td className="p-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.barcode}</div>
                </td>
                <td className="p-3">{p.category_name ?? "—"}</td>
                <td className="p-3 text-right tabular">{soles(p.cost)}</td>
                <td className="p-3 text-right font-semibold tabular">{soles(p.price)}</td>
                <td
                  className={`p-3 text-right tabular ${Number(p.stock) <= Number(p.min_stock) ? "font-bold text-destructive" : ""}`}
                >
                  {Number(p.stock)}
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setEdit({
                        id: p.id,
                        name: p.name,
                        barcode: p.barcode,
                        category_id: p.category_id,
                        unit: p.unit,
                        price: Number(p.price),
                        cost: Number(p.cost),
                        stock: Number(p.stock),
                        min_stock: Number(p.min_stock),
                        active: Boolean(p.active),
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nombre</Label>
                <Input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Código de barras</Label>
                <Input
                  value={edit.barcode ?? ""}
                  onChange={(e) => setEdit({ ...edit, barcode: e.target.value })}
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select
                  value={edit.category_id ?? ""}
                  onValueChange={(v) => setEdit({ ...edit, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegir" />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Costo (S/)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={edit.cost}
                  onChange={(e) => setEdit({ ...edit, cost: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Precio venta (S/, con IGV)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={edit.price}
                  onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })}
                />
              </div>
              {!edit.id && (
                <div>
                  <Label>Stock inicial</Label>
                  <Input
                    type="number"
                    value={edit.stock}
                    onChange={(e) => setEdit({ ...edit, stock: Number(e.target.value) })}
                  />
                </div>
              )}
              <div>
                <Label>Stock mínimo</Label>
                <Input
                  type="number"
                  value={edit.min_stock}
                  onChange={(e) => setEdit({ ...edit, min_stock: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Input
                  value={edit.unit}
                  onChange={(e) => setEdit({ ...edit, unit: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={edit.active}
                  onCheckedChange={(v) => setEdit({ ...edit, active: v })}
                />
                <Label>Activo</Label>
              </div>
              {edit.price > 0 && (
                <p className="col-span-2 text-xs text-muted-foreground">
                  Margen: {soles(edit.price - edit.cost)} (
                  {edit.cost ? Math.round(((edit.price - edit.cost) / edit.cost) * 100) : 0}%)
                </p>
              )}
              <Button className="col-span-2" onClick={save} disabled={!edit.name}>
                Guardar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
