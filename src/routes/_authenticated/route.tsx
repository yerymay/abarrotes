import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, LayoutDashboard, Package, Boxes, Receipt, LogOut } from "lucide-react";
import { logout, me } from "@/modules/auth/auth.functions";
import { useMe } from "@/modules/auth/auth.queries";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await me();
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: Shell,
});

const nav = [
  { to: "/pos", label: "Caja", icon: ShoppingCart, admin: false },
  { to: "/dashboard", label: "Resumen", icon: LayoutDashboard, admin: true },
  { to: "/productos", label: "Productos", icon: Package, admin: true },
  { to: "/inventario", label: "Inventario", icon: Boxes, admin: true },
  { to: "/ventas", label: "Ventas", icon: Receipt, admin: false },
] as const;

function Shell() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await logout();
    navigate({ to: "/auth", replace: true });
  }

  const items = nav.filter((n) => !n.admin || me?.isAdmin);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-row items-center gap-1 overflow-x-auto bg-sidebar p-2 text-sidebar-foreground md:w-56 md:flex-col md:items-stretch md:p-4">
        <div className="hidden px-2 pb-6 font-display text-xl font-extrabold md:block">
          bodega<span className="text-sidebar-primary">.pos</span>
        </div>
        {items.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold hover:bg-sidebar-accent"
            activeProps={{
              className:
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            }}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
        <div className="ml-auto md:ml-0 md:mt-auto">
          <div className="hidden px-3 pb-2 text-xs opacity-70 md:block">
            {me?.name}
            <br />
            {me?.isAdmin ? "Administrador" : "Cajero"}
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
