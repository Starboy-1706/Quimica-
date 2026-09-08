import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { endDb, query } from "./helpers/db";

/**
 * Limpieza total de la suite:
 *  - Revoca la sesión administrativa creada en el setup.
 *  - Elimina cursos E2E-* y todo su contenido derivado.
 *  - Elimina las consultas de estudiante enviadas por los tests.
 */
export default async function globalTeardown() {
  const authDir = path.join(process.cwd(), "e2e", ".auth");

  let tokenHash = "";
  try {
    tokenHash = readFileSync(path.join(authDir, "token.txt"), "utf8").trim();
  } catch {
    /* sin sesión que revocar */
  }

  if (tokenHash) {
    await query("DELETE FROM user_sessions WHERE token_hash = $1", [tokenHash]);
  }

  await query(
    `DELETE FROM course_materials
     WHERE course_id IN (SELECT id FROM courses WHERE code LIKE 'E2E-%')
        OR file_key LIKE 'security-draft%'`,
  );
  await query(
    `DELETE FROM course_announcements
     WHERE course_id IN (SELECT id FROM courses WHERE code LIKE 'E2E-%')`,
  );
  await query("DELETE FROM courses WHERE code LIKE 'E2E-%'");
  await query(
    `DELETE FROM contact_messages
     WHERE name LIKE 'Estudiante E2E%' OR message LIKE '%E2E%'`,
  );

  try {
    const localStorageDir =
      process.env.STORAGE_DIR ?? "/tmp/aula-docente-storage";
    rmSync(path.join(localStorageDir, "security-draft.pdf"));
  } catch {
    /* mejor esfuerzo */
  }
  rmSync(authDir, { recursive: true, force: true });

  await endDb();
  console.log("[e2e] Artefactos de prueba eliminados");
}
