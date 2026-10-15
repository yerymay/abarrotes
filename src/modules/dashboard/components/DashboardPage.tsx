import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/modules/dashboard/dashboard.functions";
import { soles } from "@/shared/format";

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Resumen de hoy</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Vendido hoy" value={soles(data?.total)} big />
        <Stat label="Ventas" value={String(data?.count ?? 0)} />
        <Stat
          label="Ticket promedio"
          value={soles(data && data.count ? data.total / data.count : 0)}
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Por método de pago">
          {["efectivo", "yape", "tarjeta"].map((m) => (
            <Row key={m} l={m} r={soles(data?.byMethod[m] ?? 0)} />
          ))}
        </Card>
        <Card title="Más vendidos hoy">
          {data?.topList.length ? (
            data.topList.map(([n, q]) => <Row key={n} l={n} r={`${q} und`} />)
          ) : (
            <Empty />
          )}
        </Card>
        <Card title={`Stock bajo (${data?.low.length ?? 0})`}>
          {data?.low.length ? (
            data.low.map((p) => (
              <Row
                key={p.id}
                l={p.name}
                r={`${Number(p.stock)} / mín ${Number(p.min_stock)}`}
                warn
              />
            ))
          ) : (
            <Empty t="Todo en orden" />
          )}
          {!!data?.low.length && (
            <Link to="/inventario" className="mt-2 block text-sm font-semibold text-primary">
              Reponer →
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-soft ${big ? "bg-primary text-primary-foreground" : "bg-card"}`}
    >
      <div className="text-sm opacity-80">{label}</div>
      <div className="mt-1 font-display text-3xl font-extrabold tabular">{value}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <h3 className="mb-3 font-bold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ l, r, warn }: { l: string; r: string; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="truncate capitalize">{l}</span>
      <span className={`tabular font-semibold ${warn ? "text-destructive" : ""}`}>{r}</span>
    </div>
  );
}
function Empty({ t = "Sin datos aún" }: { t?: string }) {
  return <p className="text-sm text-muted-foreground">{t}</p>;
}
