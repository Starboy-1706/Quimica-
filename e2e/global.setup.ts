import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { endDb, query } from "./helpers/db";

/**
 * Prepara la suite: crea una sesión administrativa REAL en
 * `user_sessions` (mismo mecanismo que el login) y la guarda como
 * storageState para los tests que operan el panel sin pasar por la UI.
 * El teardown revoca la sesión y limpia los datos E2E.
 */
export default async function globalSetup() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
  const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "wilmer@aula.edu";

  const admins = await query<{ id: string }>(
    "SELECT id FROM users WHERE email = $1 AND status = 'activo' LIMIT 1",
    [adminEmail],
  );
  if (admins.length === 0) {
    throw new Error(
      `[e2e] No existe la cuenta administradora ${adminEmail}. Ejecuta la semilla (npx tsx src/db/seed.ts).`,
    );
  }

  const token = randomBytes(24).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await query(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '8 hours')`,
    [admins[0].id, tokenHash],
  );

  const authDir = path.join(process.cwd(), "e2e", ".auth");
  mkdirSync(authDir, { recursive: true });

  writeFileSync(
    path.join(authDir, "admin.json"),
    JSON.stringify({
      cookies: [
        {
          name: "docencia_session",
          value: token,
          url: baseURL,
          httpOnly: true,
          secure: baseURL.startsWith("https"),
          sameSite: "Lax",
          expires: -1,
        },
      ],
      origins: [],
    }),
  );
  writeFileSync(path.join(authDir, "token.txt"), tokenHash);

  await endDb();
  console.log(`[e2e] Sesión administrativa creada para ${adminEmail}`);
}
