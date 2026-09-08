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
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

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
