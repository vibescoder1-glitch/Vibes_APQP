import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pgPool?: Pool };
export const pool = globalForPg.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX ?? 10),
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: true } : undefined,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});
if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

export async function query<T extends import("pg").QueryResultRow = import("pg").QueryResultRow>(sql: string, values: unknown[] = []) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  return pool.query<T>(sql, values);
}
