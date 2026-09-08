import { db } from "@/db";
import { siteSettings } from "@/db/schema";

/** Lecturas compartidas entre el sitio público y el panel. */

export async function getSiteSettingsMap(): Promise<Record<string, string>> {
  const rows = await db.select().from(siteSettings);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] =
      typeof row.value === "string" ? row.value : JSON.stringify(row.value);
  }
  return map;
}

export async function getProfessorPublicProfile() {
  return db.query.professorProfile.findFirst({
    with: { user: true },
  });
}
