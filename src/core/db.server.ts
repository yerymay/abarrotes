import "dotenv/config";
import mysql from "mysql2/promise";

let pool: mysql.Pool | undefined;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env["MYSQL_HOST"] ?? "127.0.0.1",
      port: Number(process.env["MYSQL_PORT"] ?? 3306),
      user: process.env["MYSQL_USER"] ?? "bodega",
      password: process.env["MYSQL_PASSWORD"] ?? "bodega_pass_2026",
      database: process.env["MYSQL_DATABASE"] ?? "bodega_pos",
      waitForConnections: true,
      connectionLimit: 10,
      decimalNumbers: true,
      dateStrings: true,
      charset: "utf8mb4",
    });
  }
  return pool;
}

export async function query<T = mysql.RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export type { PoolConnection } from "mysql2/promise";
