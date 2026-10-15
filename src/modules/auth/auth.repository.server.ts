import { query, type PoolConnection } from "@/core/db.server";

export type UserAuthRow = { id: string; password_hash: string };

export type SessionUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: number;
};

export function findAuthByEmail(email: string): Promise<UserAuthRow[]> {
  return query<UserAuthRow>("SELECT id, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
}

export function countAdmins(): Promise<{ total: number }[]> {
  return query<{ total: number }>("SELECT COUNT(*) AS total FROM user_roles WHERE role = 'admin'");
}

export function findSessionUserById(id: string): Promise<SessionUserRow[]> {
  return query<SessionUserRow>(
    `SELECT u.id, u.email, u.full_name,
            EXISTS (
              SELECT 1 FROM user_roles r
              WHERE r.user_id = u.id AND r.role = 'admin'
            ) AS is_admin
     FROM users u
     WHERE u.id = ?
     LIMIT 1`,
    [id],
  );
}

export async function insertUser(
  conn: PoolConnection,
  params: { id: string; email: string; passwordHash: string; fullName: string | null },
): Promise<void> {
  await conn.query("INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)", [
    params.id,
    params.email,
    params.passwordHash,
    params.fullName,
  ]);
}

export async function insertUserRole(
  conn: PoolConnection,
  params: { userId: string; role: string },
): Promise<void> {
  await conn.query("INSERT INTO user_roles (user_id, role) VALUES (?, ?)", [
    params.userId,
    params.role,
  ]);
}
