import { withTransaction } from "@/core/db.server";
import { endSession, getAppSession, startSession } from "@/core/session.server";
import { hashPassword, verifyPassword } from "./password.server";
import {
  countAdmins,
  findAuthByEmail,
  findSessionUserById,
  insertUser,
  insertUserRole,
} from "./auth.repository.server";
import type { LoginInput, RegisterInput, SessionUser } from "./auth.schema";

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getAppSession();
  const userId = session.data.userId;
  if (!userId) return null;

  const rows = await findSessionUserById(userId);
  const user = rows[0];
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name ?? user.email,
    isAdmin: Number(user.is_admin) === 1,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await findAuthByEmail(input.email);
  if (existing.length > 0) {
    throw new Error("Ya existe una cuenta con ese correo");
  }

  const adminRows = await countAdmins();
  const role = Number(adminRows[0]?.total ?? 0) === 0 ? "admin" : "cajero";
  const passwordHash = await hashPassword(input.password);

  const userId = await withTransaction(async (conn) => {
    const id = crypto.randomUUID();
    await insertUser(conn, {
      id,
      email: input.email,
      passwordHash,
      fullName: input.name || null,
    });
    await insertUserRole(conn, { userId: id, role });
    return id;
  });

  await startSession(userId);
  return { ok: true as const, isAdmin: role === "admin" };
}

export async function loginUser(input: LoginInput) {
  const rows = await findAuthByEmail(input.email);
  const user = rows[0];
  if (!user || !(await verifyPassword(input.password, user.password_hash))) {
    throw new Error("Correo o contraseña incorrectos");
  }
  await startSession(user.id);
  return { ok: true as const };
}

export async function logoutUser() {
  await endSession();
  return { ok: true as const };
}
