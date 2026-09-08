"use server";

import { eq, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  contentVersions,
  courseAnnouncements,
  courseMaterials,
  courses,
} from "@/db/schema";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { requireActionUser } from "@/lib/auth/session";
import { slugify } from "@/lib/format";
import {
  MAX_IMPORT_BYTES,
  normalizeJsonImport,
  parseCsvImport,
  type NormalizedCourse,
  type NormalizedImport,
} from "@/lib/transfer/course-transfer";
import type {
  ImportExecuteState,
  ImportPreviewState,
} from "@/lib/transfer/import-state";

/**
 * Importación de estructuras de cursos (CSV/JSON) — solo Administrador.
 * Flujo en dos pasos con confirmación humana:
 *   1. previewImportAction  → normaliza y resume (sin escribir nada).
 *   2. executeImportAction  → crea cursos como BORRADOR, omitiendo
 *      códigos ya existentes, con versiones y firma en la bitácora.
 * Los estados iniciales y tipos del asistente viven en
 * src/lib/transfer/import-state.ts (los archivos «use server» solo
 * pueden exportar funciones async).
 */
export async function previewImportAction(
  _prev: ImportPreviewState,
  formData: FormData,
): Promise<ImportPreviewState> {
  try {
    await requireActionUser(["administrador"]);

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { status: "error", error: "Adjunta un archivo .json o .csv." };
    }
    if (file.size > MAX_IMPORT_BYTES) {
      return {
        status: "error",
        error: `El archivo supera el límite de ${MAX_IMPORT_BYTES / 1024} KB.`,
      };
    }

    const name = file.name.toLowerCase();
    const text = await file.text();
    const result = name.endsWith(".csv")
      ? parseCsvImport(text)
      : normalizeJsonImport(safeJson(text));

    if (!result.ok) {
      return { status: "error", error: result.error };
    }

    // Códigos que chocarían con cursos ya existentes (aviso anticipado).
    const codes = result.data.resumen.codigos;
    const existing = codes.length
      ? await db
          .select({ code: courses.code })
          .from(courses)
          .limit(200)
      : [];
    const existingSet = new Set(existing.map((row) => row.code));
    const duplicados = codes.filter((code) => existingSet.has(code));
    if (duplicados.length > 0) {
      result.data.resumen.advertencias.push(
        `Ya existen en el portal y se omitirán: ${duplicados.join(", ")}.`,
      );
    }

    return {
      status: "preview",
      error: null,
      fileName: file.name,
      resumen: result.data.resumen,
      payload: JSON.stringify(result.data.cursos),
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "No se pudo leer el archivo.",
    };
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function ensureUniqueSlug(title: string): Promise<string> {
  const root = slugify(title) || "curso";
  const existing = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(like(courses.slug, `${root}%`));
  const taken = new Set(existing.map((row) => row.slug));
  if (!taken.has(root)) return root;
  let index = 2;
  while (taken.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

export async function executeImportAction(
  _prev: ImportExecuteState,
  formData: FormData,
): Promise<ImportExecuteState> {
  try {
    const actor = await requireActionUser(["administrador"]);

    const payloadRaw = String(formData.get("payload") ?? "");
    const newTerm = String(formData.get("nuevoPeriodo") ?? "").trim();
    const includeMaterials = formData.get("incluirMateriales") === "on";
    const includeAnnouncements = formData.get("incluirAvisos") === "on";

    let cursosImport: NormalizedCourse[];
    try {
      const parsed = JSON.parse(payloadRaw) as NormalizedCourse[];
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
      cursosImport = parsed;
    } catch {
      return { status: "error", error: "El paquete de importación es inválido o expiró. Repite la vista previa." };
    }

    const creados: Array<{ codigo: string; titulo: string }> = [];
    const omitidos: Array<{ codigo: string; motivo: string }> = [];
    let totalMateriales = 0;
    let totalAvisos = 0;

    for (const item of cursosImport) {
      const codigo = String(item.codigo ?? "").toUpperCase().slice(0, 20);
      const titulo = String(item.titulo ?? "").slice(0, 160);
      if (!codigo || !titulo) {
        omitidos.push({ codigo: codigo || "—", motivo: "sin código o título" });
        continue;
      }

      const [duplicated] = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.code, codigo))
        .limit(1);
      if (duplicated) {
        omitidos.push({ codigo, motivo: "el código ya existe en el portal" });
        continue;
      }

      const slug = await ensureUniqueSlug(titulo);

      const [created] = await db
        .insert(courses)
        .values({
          code: codigo,
          title: titulo,
          slug,
          level: item.nivel ?? "grado",
          term: newTerm || item.periodo || null,
          credits: item.creditos ?? null,
          room: item.aula ?? null,
          description: item.descripcion ?? null,
          schedule: Array.isArray(item.horario) ? item.horario : [],
          status: "borrador", // toda importación entra en revisión
          createdBy: actor.id,
          updatedBy: actor.id,
        })
        .returning();

      await db.insert(contentVersions).values({
        entity: "course",
        entityId: created.id,
        version: 1,
        data: { ...created },
        changedBy: actor.id,
        changeNote: "Creación por importación de estructura",
      });

      if (includeMaterials && Array.isArray(item.materiales)) {
        for (const material of item.materiales) {
          if (!material.titulo || !material.url) continue;
          const [savedMaterial] = await db
            .insert(courseMaterials)
            .values({
              courseId: created.id,
              title: material.titulo.slice(0, 160),
              type: material.categoria ?? "apunte",
              url: material.url.slice(0, 600),
              unit: material.unidad ?? null,
              description: material.descripcion ?? null,
              sortOrder: material.orden ?? 0,
              status: "borrador",
              createdBy: actor.id,
              updatedBy: actor.id,
            })
            .returning();
          await db.insert(contentVersions).values({
            entity: "course_material",
            entityId: savedMaterial.id,
            version: 1,
            data: { ...savedMaterial },
            changedBy: actor.id,
            changeNote: "Creación por importación de estructura",
          });
          totalMateriales += 1;
        }
      }

      if (includeAnnouncements && Array.isArray(item.avisos)) {
        for (const aviso of item.avisos) {
          if (!aviso.titulo || !aviso.cuerpo) continue;
          const [savedAnnouncement] = await db
            .insert(courseAnnouncements)
            .values({
              courseId: created.id,
              title: aviso.titulo.slice(0, 160),
              body: aviso.cuerpo.slice(0, 2000),
              kind: aviso.tipo ?? "general",
              eventDate: aviso.fechaEvento ? new Date(aviso.fechaEvento) : null,
              pinned: aviso.fijado === true,
              status: "borrador",
              createdBy: actor.id,
              updatedBy: actor.id,
            })
            .returning();
          await db.insert(contentVersions).values({
            entity: "course_announcement",
            entityId: savedAnnouncement.id,
            version: 1,
            data: { ...savedAnnouncement },
            changedBy: actor.id,
            changeNote: "Creación por importación de estructura",
          });
          totalAvisos += 1;
        }
      }

      creados.push({ codigo, titulo });
    }

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.IMPORT_COURSES,
      entity: "course",
      summary: `${actor.fullName} importó ${creados.length} cursos (${totalMateriales} materiales, ${totalAvisos} avisos) · omitidos: ${omitidos.length}`,
      metadata: {
        creados: creados.map((c) => c.codigo),
        omitidos,
        materiales: totalMateriales,
        avisos: totalAvisos,
        nuevoPeriodo: newTerm || null,
      },
    });

    revalidatePath("/admin/cursos");
    revalidatePath("/admin/materiales");
    revalidatePath("/admin/avisos");
    revalidatePath("/admin/transferencia");
    revalidatePath("/admin");

    return {
      status: "done",
      error: null,
      creados,
      omitidos,
      materiales: totalMateriales,
      avisos: totalAvisos,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "No se pudo completar la importación.",
    };
  }
}
