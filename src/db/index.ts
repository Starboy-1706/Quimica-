import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Conexión PostgreSQL vía Drizzle ORM.
 *
 * Compatible con Supabase PostgreSQL: basta con apuntar `DATABASE_URL`
 * al connection pooler del proyecto (puerto 6543) o a la conexión
 * directa (puerto 5432). Se habilita TLS automáticamente cuando la URL
 * corresponde a Supabase o declara `sslmode=require`.
 *
 * Fallback a URL local inocua para que `npm run build` o la CI puedan
 * compilar sin que el módulo falle por ausencia de variable en tiempo
 * de importación.
 */
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const requiresSsl =
  databaseUrl.includes("supabase") || databaseUrl.includes("sslmode=require");

const globalForDb = globalThis as typeof globalThis & {
  __docenciaPool?: Pool;
};

export const pool =
  globalForDb.__docenciaPool ??
  new Pool({
    connectionString: databaseUrl,
    ...(requiresSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__docenciaPool = pool;
}

export const db = drizzle(pool, { schema });
