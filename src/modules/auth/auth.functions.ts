import { createServerFn } from "@tanstack/react-start";
import { parseLogin, parseRegister, type SessionUser } from "./auth.schema";
import { getSessionUser, loginUser, logoutUser, registerUser } from "./auth.service.server";
import { requireAuth } from "./auth.middleware.server";

export const register = createServerFn({ method: "POST" })
  .validator(parseRegister)
  .handler(async ({ data }) => registerUser(data));

export const login = createServerFn({ method: "POST" })
  .validator(parseLogin)
  .handler(async ({ data }) => loginUser(data));

export const logout = createServerFn({ method: "POST" }).handler(async () => logoutUser());

export const me = createServerFn({ method: "GET" }).handler(async (): Promise<SessionUser | null> =>
  getSessionUser(),
);

export const requireUser = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => context.user);
