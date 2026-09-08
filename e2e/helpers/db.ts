import "dotenv/config";
import { Pool } from "pg";

/**
 * Acceso directo a la base de datos para setup, aserciones y limpieza.
 * Pool perezoso y auto-recuperable: Playwright ejecuta setup y teardown
 * en el mismo proceso principal, así que `endDb()` puede cerrar el pool
 * antes de que el siguiente consumidor lo use; se recrea transparente.
 */
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool || pool.ended) {
    pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ??
        "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query(text, params as never[]);
  return result.rows as T[];
}

export async function endDb(): Promise<void> {
  if (pool && !pool.ended) await pool.end();
  pool = null;
}
