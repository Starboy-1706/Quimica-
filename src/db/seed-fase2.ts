import "dotenv/config";
import { eq, like } from "drizzle-orm";
import { db, pool } from "./index";
import {
  auditLogs,
  contactMessages,
  courseAnnouncements,
  courseMaterials,
  courses,
  professorProfile,
  siteSettings,
  users,
} from "./schema";

/**
 * Enriquecimiento de fase 2 — instalación YA existente (con datos de
 * informática generados en la fase 1):
 *   1. Reorienta el aula al Departamento de Química (Prof. Wilmer Molina).
 *   2. Mueve los cursos de informática a la papelera lógica (deletedAt),
 *      conservando historial y versiones → sirve para probar restauración.
 *   3. Inserta las asignaturas de química con horarios, aulas y niveles.
 *   4. Inserta colores institucionales y consultas de ejemplo.
 * Idempotente: se sale sin tocar nada si ya existe el curso QU-101.
 */
async function main() {
  const chemistry = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.code, "QU-101"))
    .limit(1);
  if (chemistry.length > 0) {
    console.log("La fase 2 ya fue aplicada (existe QU-101).");
    return;
  }

  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "wilmer@aula.edu"))
    .limit(1);
  if (!admin) {
    throw new Error("Ejecuta primero la semilla base (falta wilmer@aula.edu).");
  }

  const now = new Date();

  /* 1 ▸ Nombre completo y perfil de química */
  await db
    .update(users)
    .set({ fullName: "Wilmer Molina Torres", updatedAt: now })
    .where(eq(users.id, admin.id));

  await db
    .update(professorProfile)
    .set({
      headline: "Químico · Ph.D. en Química Orgánica",
      department: "Departamento de Química · Facultad de Ciencias",
      bio: "Docente universitario especializado en química orgánica y didáctica de las ciencias experimentales. Investigador en síntesis sostenible; convencido de que el laboratorio es el mejor aula.",
      office: "Pabellón de Química · Despacho Q-204",
      officeHours: "Lunes y miércoles · 10:00 — 12:00",
      contactEmail: "wilmer@aula.edu",
      updatedAt: now,
    })
    .where(eq(professorProfile.userId, admin.id));

  /* 2 ▸ Cursos de informática → papelera (borrado lógico) */
  const legacy = await db
    .select()
    .from(courses)
    .where(like(courses.code, "IF-%"));
  for (const course of legacy) {
    if (course.deletedAt) continue;
    await db
      .update(courses)
      .set({
        deletedAt: now,
        status: "archivado",
        version: course.version + 1,
        updatedAt: now,
        updatedBy: admin.id,
      })
      .where(eq(courses.id, course.id));
    await db
      .update(courseMaterials)
      .set({ deletedAt: now, status: "archivado", updatedAt: now })
      .where(eq(courseMaterials.courseId, course.id));
    await db
      .update(courseAnnouncements)
      .set({ deletedAt: now, status: "archivado", updatedAt: now })
      .where(eq(courseAnnouncements.courseId, course.id));
  }

  /* 3 ▸ Colores institucionales */
  for (const [key, value, description] of [
    ["brand_primary", "#0f5e5b", "Color primario institucional (hex)"],
    ["brand_accent", "#c9a03a", "Color de acento institucional (hex)"],
  ] as const) {
    await db
      .insert(siteSettings)
      .values({ key, value, description, updatedBy: admin.id })
      .onConflictDoNothing();
  }

  await db
    .update(siteSettings)
    .set({
      value: "La química, explicada con rigor",
      updatedAt: now,
      updatedBy: admin.id,
    })
    .where(eq(siteSettings.key, "site_title"));
  await db
    .update(siteSettings)
    .set({
      value:
        "Asignaturas, prácticas de laboratorio y material de estudio del Prof. Wilmer Molina.",
      updatedAt: now,
      updatedBy: admin.id,
    })
    .where(eq(siteSettings.key, "site_tagline"));

  /* 4 ▸ Asignaturas de química */
  const [qg1, qo, qa] = await db
    .insert(courses)
    .values([
      {
        code: "QU-101",
        slug: "quimica-general-i",
        title: "Química General I",
        description:
          "**Curso fundamental** del Departamento de Química.\n\n- Estructura atómica y tabla periódica\n- Enlace químico: iónico, covalente y metálico\n- Estequiometría: moles de H~2~O por mol de Ca(OH)~2~\n- Disoluciones y concentración: `M = n / V`\n\n*Laboratorio semanal obligatorio con bata y gafas de seguridad.*",
        term: "2026-I",
        credits: 4,
        level: "grado",
        room: "Aula Q-12",
        schedule: [
          { day: "Lunes", start: "10:00", end: "12:00", room: "Aula Q-12" },
          { day: "Jueves", start: "14:00", end: "16:00", room: "Lab. Q-3" },
        ],
        status: "publicado",
        publishedAt: now,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        code: "QU-205",
        slug: "quimica-organica",
        title: "Química Orgánica",
        description:
          "**Grupos funcionales, nomenclatura IUPAC y mecanismos de reacción.**\n\nAlcanos, alquenos, aromáticos; isomería y estereoquímica; sustitución nucleofílica SN~1~/SN~2~ y eliminación E~1~/E~2~.",
        term: "2026-I",
        credits: 4,
        level: "grado",
        room: "Aula Q-21",
        schedule: [
          { day: "Martes", start: "08:00", end: "10:00", room: "Aula Q-21" },
          { day: "Viernes", start: "10:00", end: "12:00", room: "Lab. Q-5" },
        ],
        status: "publicado",
        publishedAt: now,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        code: "QM-501",
        slug: "quimica-cuantica-avanzada",
        title: "Química Cuántica Avanzada",
        description:
          "**Seminario de máster.** Aproximaciones orbital y de campo autoconsistente, funcionales de densidad `DFT` y métodos post-Hartree-Fock aplicados a sistemas moleculares de interés orgánico.",
        term: "2026-I",
        credits: 3,
        level: "master",
        room: "Seminario Q-2",
        schedule: [
          { day: "Miércoles", start: "16:00", end: "19:00", room: "Seminario Q-2" },
        ],
        status: "borrador",
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    ])
    .returning();

  /* 5 ▸ Materiales por categorías */
  const materialsSeed = [
    [qg1.id, "Programa del curso (syllabus) 2026-I", "syllabus", "General", "publicado"],
    [qg1.id, "Guía de prácticas Nº1 — Titulación ácido-base", "laboratorio", "Unidad 2", "publicado"],
    [qg1.id, "Presentación — Estructura atómica y tabla periódica", "presentacion", "Semana 1", "publicado"],
    [qg1.id, "Ejercicios resueltos — Estequiometría", "ejercicios", "Unidad 3", "publicado"],
    [qo.id, "Programa del curso (syllabus) 2026-I", "syllabus", "General", "publicado"],
    [qo.id, "Guía de prácticas — Identificación de grupos funcionales", "laboratorio", "Unidad 1", "publicado"],
    [qo.id, "Presentación — Mecanismos SN1 / SN2", "presentacion", "Semana 5", "borrador"],
    [qa.id, "Lectura inicial — Aproximación de Born-Oppenheimer", "apunte", "Semana 1", "borrador"],
  ] as const;

  await db.insert(courseMaterials).values(
    materialsSeed.map(([courseId, title, type, unit, status], index) => ({
      courseId,
      title,
      type,
      unit,
      url: "https://example.org/repositorio/documento.pdf",
      sortOrder: index,
      status,
      publishedAt: status === "publicado" ? now : null,
      createdBy: admin.id,
      updatedBy: admin.id,
    })),
  );

  /* 6 ▸ Avisos de química */
  await db.insert(courseAnnouncements).values([
    {
      courseId: qg1.id,
      title: "Examen parcial — Unidades 1 a 3",
      body: "El parcial cubrirá estructura atómica, enlace químico y estequiometría. Está permitida una hoja de fórmulas manuscrita. Repasar los **ejercicios resueltos** de la Unidad 3.",
      kind: "examen",
      eventDate: new Date(now.getTime() + 14 * 86_400_000),
      pinned: true,
      status: "publicado",
      publishedAt: now,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
    {
      courseId: qo.id,
      title: "Cambio de aula — sesión del viernes",
      body: "La práctica de identificación de grupos funcionales se traslada al **Lab. Q-7** esta semana por mantenimiento del Q-5.",
      kind: "cambio_aula",
      eventDate: new Date(now.getTime() + 4 * 86_400_000),
      pinned: false,
      status: "publicado",
      publishedAt: now,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
    {
      courseId: qg1.id,
      title: "Entrega del informe de laboratorio Nº1",
      body: "El informe de la titulación se entrega en PDF antes del domingo 23:59 por el aula virtual.",
      kind: "entrega",
      eventDate: new Date(now.getTime() + 6 * 86_400_000),
      pinned: false,
      status: "borrador",
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  ]);

  /* 7 ▸ Consultas de ejemplo para la bandeja */
  await db.insert(contactMessages).values([
    {
      name: "Lucía Fernández",
      email: "lucia.fernandez@estudiantes.edu",
      courseId: qg1.id,
      subject: "Duda sobre la titulación",
      message:
        "Profesor, en la guía de prácticas Nº1 no me queda claro cómo calcular el punto de equivalencia cuando el indicador es fenolftaleína. ¿Debo usar el volumen del viraje o interpolar la curva?",
      ipHash: null,
      userAgent: "semilla",
    },
    {
      name: "Marco Herrera",
      email: "marco.herrera@estudiantes.edu",
      courseId: qo.id,
      subject: "Repaso para el parcial",
      message:
        "¿Podría publicar los ejercicios resueltos de SN2 antes del examen parcial? Me vendría bien para comparar con mis apuntes de la semana 5.",
      status: "leido",
      readAt: now,
      ipHash: null,
      userAgent: "semilla",
    },
  ]);

  /* 8 ▸ Auditoría del reenfoque */
  await db.insert(auditLogs).values({
    actorId: admin.id,
    actorEmail: admin.email,
    actorRole: admin.role,
    action: "sistema.inicializar",
    entity: "system",
    summary:
      "Fase 2 aplicada: aula reorientada a Química (Wilmer Molina), cursos IF-* a la papelera, 3 asignaturas de química, colores institucionales y consultas de ejemplo.",
    metadata: {
      cursosPapelera: legacy.length,
      cursosQuimica: 3,
    },
  });

  console.log("Fase 2 aplicada correctamente:");
  console.log("   · Perfil de química + colores institucionales");
  console.log(`   · ${legacy.length} cursos IF-* movidos a la papelera`);
  console.log("   · 3 asignaturas de química, 8 materiales, 3 avisos");
  console.log("   · 2 consultas de ejemplo en la bandeja");
}

main()
  .catch((error) => {
    console.error("Error en la semilla de fase 2:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
