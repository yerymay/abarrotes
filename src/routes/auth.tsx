import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { me } from "@/modules/auth/auth.functions";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar — Bodega POS" },
      { name: "description", content: "Ingresa o crea tu cuenta de Bodega POS." },
      { property: "og:title", content: "Ingresar — Bodega POS" },
      { property: "og:description", content: "Ingresa o crea tu cuenta de Bodega POS." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");

  useEffect(() => {
    me().then((user) => {
      if (user) navigate({ to: "/pos", replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-soft">
        <Link to="/" className="font-display text-lg font-extrabold text-primary">
          bodega.pos
        </Link>
        <h1 className="mt-4 text-2xl font-bold">
          {mode === "in" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "in"
            ? "Ingresa para abrir la caja."
            : "La primera cuenta será la del dueño (administrador)."}
        </p>
        {mode === "in" ? (
          <LoginForm onSuccess={() => navigate({ to: "/pos", replace: true })} />
        ) : (
          <RegisterForm
            onSuccess={(result) => {
              if (result.isAdmin) toast.success("Cuenta de administrador creada.");
              navigate({ to: "/pos", replace: true });
            }}
          />
        )}
        <button
          className="mt-4 w-full text-center text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
        </button>
      </div>
    </div>
  );
}
