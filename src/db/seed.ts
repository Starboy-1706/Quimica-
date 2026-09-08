import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import {
  auditLogs,
  contentVersions,
  courseAnnouncements,
  courseMaterials,
  courses,
  professorProfile,
  siteSettings,
  users,
} from "./schema";
import { hashPassword } from "../lib/auth/passwords";

/**
 * Semilla inicial del aula docente del Prof. Wilmer Molina (Química).
 * Ejecutar con:  npx tsx src/db/seed.ts
 * Idempotente: si ya existe la cuenta administradora, no hace nada.
 */
async function main() {
  const adminEmail = "wilmer@aula.edu";

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log("La semilla ya fue aplicada (existe", adminEmail + ").");
    return;
  }

  /* ── Cuentas individuales ──────────────────────────────────────── */
  const [admin] = await db
    .insert(users)
    .values({
      fullName: "Wilmer Molina Torres",
      email: adminEmail,
      role: "administrador",
      passwordHash: await hashPassword("Aula#2026"),
    })
    .returning();

  await db.insert(users).values({
    fullName: "Ana Quispe Ramos",
    email: "ayudante@aula.edu",
    role: "editor",
    passwordHash: await hashPassword("Ayudante#2026"),
  });

  /* ── Perfil docente público ────────────────────────────────────── */
  await db.insert(professorProfile).values({
    userId: admin.id,
    headline: "Químico · Ph.D. en Química Orgánica",
    department: "Departamento de Química · Facultad de Ciencias",
    bio: "Docente universitario especializado en química orgánica y didáctica de las ciencias experimentales. Investigador en síntesis sostenible; convencido de que el laboratorio es el mejor aula.",
    office: "Pabellón de Química · Despacho Q-204",
    officeHours: "Lunes y miércoles · 10:00 — 12:00",
    contactEmail: adminEmail,
    links: [],
  });

  /* ── Ajustes del sitio ─────────────────────────────────────────── */
  const settingsSeed: Array<{
    key: string;
    value: string;
    description: string;
  }> = [
    {
      key: "site_title",
      value: "La química, explicada con rigor",
      description: "Título principal del sitio público",
    },
    {
      key: "site_tagline",
      value:
        "Asignaturas, prácticas de laboratorio y material de estudio del Prof. Wilmer Molina.",
      description: "Frase de presentación bajo el título",
    },
    {
      key: "site_description",
      value:
        "Portal académico del Departamento de Química: asignaturas de grado y posgrado, guías de prácticas, ejercicios resueltos, presentaciones y programas de cada curso.",
      description: "Descripción larga para la sección de bienvenida",
    },
    {
      key: "academic_term",
      value: "2026-I",
      description: "Período académico en curso",
    },
    {
      key: "brand_primary",
      value: "#0f5e5b",
      description: "Color primario institucional (hex)",
    },
    {
      key: "brand_accent",
      value: "#c9a03a",
      description: "Color de acento institucional (hex)",
    },
  ];
  for (const setting of settingsSeed) {
    await db
      .insert(siteSettings)
      .values({ ...setting, updatedBy: admin.id })
      .onConflictDoNothing();
  }

  /* ── Asignaturas de química ────────────────────────────────────── */
  const now = new Date();
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

  /* ── Materiales por categorías ─────────────────────────────────── */
  const materialsSeed = [
    {
      courseId: qg1.id,
      title: "Programa del curso (syllabus) 2026-I",
      type: "syllabus" as const,
      unit: "General",
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qg1.id,
      title: "Guía de prácticas Nº1 — Titulación ácido-base",
      type: "laboratorio" as const,
      unit: "Unidad 2",
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qg1.id,
      title: "Presentación — Estructura atómica y tabla periódica",
      type: "presentacion" as const,
      unit: "Semana 1",
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qg1.id,
      title: "Ejercicios resueltos — Estequiometría",
      type: "ejercicios" as const,
      unit: "Unidad 3",
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qo.id,
      title: "Programa del curso (syllabus) 2026-I",
      type: "syllabus" as const,
      unit: "General",
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qo.id,
      title: "Guía de prácticas — Identificación de grupos funcionales",
      type: "laboratorio" as const,
      unit: "Unidad 1",
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qo.id,
      title: "Presentación — Mecanismos SN1 / SN2",
      type: "presentacion" as const,
      unit: "Semana 5",
      status: "borrador" as const,
    },
    {
      courseId: qa.id,
      title: "Lectura inicial — Aproximación de Born-Oppenheimer",
      type: "apunte" as const,
      unit: "Semana 1",
      status: "borrador" as const,
    },
  ];
  const insertedMaterials = await db
    .insert(courseMaterials)
    .values(
      materialsSeed.map((material, index) => ({
        ...material,
        url: "https://example.org/repositorio/documento.pdf",
        sortOrder: index,
        createdBy: admin.id,
        updatedBy: admin.id,
      })),
    )
    .returning();

  /* ── Avisos ────────────────────────────────────────────────────── */
  const announcementsSeed = [
    {
      courseId: null,
      title: "Bienvenidos al período 2026-I",
      body: "Iniciamos el semestre con dos asignaturas de grado activas y un seminario de máster en preparación. Recuerden que el uso de bata y gafas es **obligatorio** en todos los laboratorios.",
      kind: "general" as const,
      eventDate: null,
      pinned: true,
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qg1.id,
      title: "Examen parcial — Unidades 1 a 3",
      body: "El parcial cubrirá estructura atómica, enlace químico y estequiometría. Está permitida una hoja de fórmulas manuscrita. Repasar los **ejercicios resueltos** de la Unidad 3.",
      kind: "examen" as const,
      eventDate: new Date(now.getTime() + 14 * 86_400_000),
      pinned: true,
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qo.id,
      title: "Cambio de aula — sesión del viernes",
      body: "La práctica de identificación de grupos funcionales se traslada al **Lab. Q-7** durante esta semana por mantenimiento del Q-5.",
      kind: "cambio_aula" as const,
      eventDate: new Date(now.getTime() + 4 * 86_400_000),
      pinned: false,
      status: "publicado" as const,
      publishedAt: now,
    },
    {
      courseId: qg1.id,
      title: "Entrega del informe de laboratorio Nº1",
      body: "Recordatorio: el informe de la titulación se entrega en formato PDF antes del domingo 23:59 por el aula virtual.",
      kind: "entrega" as const,
      eventDate: new Date(now.getTime() + 6 * 86_400_000),
      pinned: false,
      status: "borrador" as const,
    },
  ];
  const insertedAnnouncements = await db
    .insert(courseAnnouncements)
    .values(
      announcementsSeed.map((announcement) => ({
        ...announcement,
        createdBy: admin.id,
        updatedBy: admin.id,
      })),
    )
    .returning();

  /* ── Snapshots iniciales en content_versions ───────────────────── */
  const snapshots = [
    ...[qg1, qo, qa].map((course) => ({
      entity: "course",
      entityId: course.id,
      data: { ...course },
    })),
    ...insertedMaterials.map((material) => ({
      entity: "course_material",
      entityId: material.id,
      data: { ...material },
    })),
    ...insertedAnnouncements.map((announcement) => ({
      entity: "course_announcement",
      entityId: announcement.id,
      data: { ...announcement },
    })),
  ];
  await db.insert(contentVersions).values(
    snapshots.map((snapshot) => ({
      entity: snapshot.entity,
      entityId: snapshot.entityId,
      version: 1,
      data: snapshot.data as Record<string, unknown>,
      changedBy: admin.id,
      changeNote: "Semilla inicial",
    })),
  );

  /* ── Evento de auditoría ───────────────────────────────────────── */
  await db.insert(auditLogs).values({
    actorId: admin.id,
    actorEmail: admin.email,
    actorRole: admin.role,
    action: "sistema.inicializar",
    entity: "system",
    summary:
      "Semilla inicial: cuentas, perfil docente, 3 asignaturas de química, materiales por categorías y avisos.",
    metadata: {
      cursos: 3,
      materiales: insertedMaterials.length,
      avisos: insertedAnnouncements.length,
    },
  });

  console.log("Semilla aplicada correctamente:");
  console.log("   · Administrador → wilmer@aula.edu / Aula#2026");
  console.log("   · Editor        → ayudante@aula.edu / Ayudante#2026");
  console.log("   · 3 asignaturas de química, 8 materiales, 4 avisos");
}

main()
  .catch((error) => {
    console.error("Error al aplicar la semilla:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
