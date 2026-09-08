import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit — migraciones versionadas.
 *
 * `DATABASE_URL` puede apuntar a Supabase PostgreSQL (pooler o conexión
 * directa, formato: postgresql://postgres.<ref>:<pass>@aws-0-<region>.pooler.supabase.com:6543/postgres)
 * o a la instancia local de desarrollo.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
