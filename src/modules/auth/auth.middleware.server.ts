import { createMiddleware } from "@tanstack/react-start";
import { getSessionUser } from "./auth.service.server";

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const user = await getSessionUser();
  if (!user) throw new Error("No autenticado");
  return next({ context: { user } });
});

export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const user = await getSessionUser();
  if (!user) throw new Error("No autenticado");
  if (!user.isAdmin) throw new Error("Solo administradores");
  return next({ context: { user } });
});
