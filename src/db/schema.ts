/**
 * Modelo de base de datos — Plataforma docente del Prof. Wilmer Molina
 * (Departamento de Química)
 * ------------------------------------------------------------------
 * Tablas relacionales:
 *   users · user_sessions · professor_profile
 *   courses · course_materials · course_announcements
 *   site_settings · audit_logs · content_versions · contact_messages
 *
 * Toda tabla de contenido implementa los campos de control estándar:
 *   id, status, createdAt, updatedAt, publishedAt, deletedAt,
 *   createdBy, updatedBy, version
 *
 * Flujo editorial: borrador → publicado → archivado, con papelera
 * lógica (deletedAt) restaurable desde el panel.
 */
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enumeraciones                                                       */
/* ------------------------------------------------------------------ */

/** Roles académicos definidos en el servidor (nunca confiar en el cliente). */
export const academicRoleEnum = pgEnum("academic_role", [
  "administrador",
  "editor",
]);

export const userStatusEnum = pgEnum("user_status", ["activo", "suspendido"]);

/** Ciclo de vida editorial de cualquier contenido docente. */
export const contentStatusEnum = pgEnum("content_status", [
  "borrador",
  "publicado",
  "archivado",
]);

/** Nivel universitario de la asignatura. */
export const courseLevelEnum = pgEnum("course_level", [
  "grado",
  "master",
  "doctorado",
]);

/** Tipología de materiales didácticos del repositorio. */
export const materialTypeEnum = pgEnum("material_type", [
  "apunte",
  "guia",
  "laboratorio",
  "presentacion",
  "ejercicios",
  "syllabus",
  "enlace",
]);

/** Tipología editorial de los avisos. */
export const announcementKindEnum = pgEnum("announcement_kind", [
  "general",
  "examen",
  "cambio_aula",
  "entrega",
]);

/** Estados de la bandeja de consultas estudiantiles. */
export const contactStatusEnum = pgEnum("contact_status", [
  "nuevo",
  "leido",
  "respondido",
  "archivado",
]);

export type AcademicRole = (typeof academicRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
export type ContentStatus = (typeof contentStatusEnum.enumValues)[number];
export type CourseLevel = (typeof courseLevelEnum.enumValues)[number];
export type MaterialType = (typeof materialTypeEnum.enumValues)[number];
export type AnnouncementKind =
  (typeof announcementKindEnum.enumValues)[number];
export type ContactStatus = (typeof contactStatusEnum.enumValues)[number];

/** Una sesión de horario semanal de una asignatura. */
export type CourseSession = {
  day: string;
  start: string;
  end: string;
  room?: string;
};

/* ------------------------------------------------------------------ */
/* users — cuentas individuales (sin contraseñas compartidas)          */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    /** Hash scrypt de la contraseña individual. */
    passwordHash: text("password_hash").notNull(),
    role: academicRoleEnum("role").notNull().default("editor"),
    status: userStatusEnum("status").notNull().default("activo"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_email_key").on(t.email)],
);

/* ------------------------------------------------------------------ */
/* Campos de control estándar para tablas de contenido                 */
/* ------------------------------------------------------------------ */

const contentControl = {
  status: contentStatusEnum("status").notNull().default("borrador"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  /** Borrado lógico (papelera restaurable): nunca se destruye físicamente. */
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  version: integer("version").notNull().default(1),
};

/* ------------------------------------------------------------------ */
/* user_sessions — sesiones persistidas (cookies httpOnly)             */
/* ------------------------------------------------------------------ */

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 del token entregado al navegador. Nunca se guarda en claro. */
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("user_sessions_token_hash_key").on(t.tokenHash),
    index("user_sessions_user_id_idx").on(t.userId),
  ],
);

/* ------------------------------------------------------------------ */
/* professor_profile — datos públicos del docente                      */
/* ------------------------------------------------------------------ */

export const professorProfile = pgTable(
  "professor_profile",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    headline: text("headline"),
    /** Departamento / unidad académica, p. ej. «Departamento de Química». */
    department: text("department"),
    bio: text("bio"),
    office: text("office"),
    officeHours: text("office_hours"),
    /** Correo institucional público de contacto. */
    contactEmail: text("contact_email"),
    avatarUrl: text("avatar_url"),
    links: jsonb("links").$type<{ label: string; url: string }[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("professor_profile_user_id_key").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* courses — asignaturas de química (Grado / Máster / Doctorado)       */
/* ------------------------------------------------------------------ */

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    /** Texto enriquecido sanitizado (negritas, sub/superíndices, enlaces). */
    description: text("description"),
    /** Período académico, p. ej. "2026-I". */
    term: text("term"),
    credits: integer("credits"),
    /** Nivel universitario: grado · máster · doctorado. */
    level: courseLevelEnum("level").notNull().default("grado"),
    /** Aula principal del curso, p. ej. "Aula Q-12". */
    room: text("room"),
    /** Horario semanal: [{ day, start, end, room }] */
    schedule: jsonb("schedule").$type<CourseSession[]>(),
    ...contentControl,
  },
  (t) => [
    uniqueIndex("courses_code_key").on(t.code),
    uniqueIndex("courses_slug_key").on(t.slug),
    index("courses_status_idx").on(t.status),
  ],
);

/* ------------------------------------------------------------------ */
/* course_materials — repositorio por asignatura (categorías)          */
/* ------------------------------------------------------------------ */

export const courseMaterials = pgTable(
  "course_materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    /**
     * Categoría: apunte · guia · laboratorio (guías de prácticas) ·
     * presentacion · ejercicios (resueltos) · syllabus · enlace.
     */
    type: materialTypeEnum("type").notNull().default("apunte"),
    /**
     * URL de acceso. Para archivos subidos es interna y restringida
     * (/archivos/<fileKey>); para recursos externos, la URL completa.
     */
    url: text("url").notNull(),
    /** Metadatos del archivo cuando proviene de una subida a Storage. */
    fileKey: text("file_key"),
    fileName: text("file_name"),
    fileSize: integer("file_size"),
    /** Unidad temática / semana, p. ej. "Unidad 2". */
    unit: text("unit"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...contentControl,
  },
  (t) => [
    index("course_materials_course_idx").on(t.courseId),
    index("course_materials_status_idx").on(t.status),
    uniqueIndex("course_materials_file_key_key").on(t.fileKey),
  ],
);

/* ------------------------------------------------------------------ */
/* course_announcements — avisos y novedades por asignatura            */
/* ------------------------------------------------------------------ */

export const courseAnnouncements = pgTable(
  "course_announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** NULL = aviso general del sitio, visible para todas las asignaturas. */
    courseId: uuid("course_id").references(() => courses.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    /** Texto enriquecido sanitizado. */
    body: text("body").notNull(),
    /** Categoría del aviso: general · examen · cambio de aula · entrega. */
    kind: announcementKindEnum("kind").notNull().default("general"),
    /** Fecha del evento asociado (examen, entrega, sesión reprogramada). */
    eventDate: timestamp("event_date", { withTimezone: true }),
    pinned: boolean("pinned").notNull().default(false),
    ...contentControl,
  },
  (t) => [
    index("course_announcements_course_idx").on(t.courseId),
    index("course_announcements_status_idx").on(t.status),
  ],
);

/* ------------------------------------------------------------------ */
/* contact_messages — bandeja de consultas estudiantiles               */
/* ------------------------------------------------------------------ */

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    /** Asignatura de referencia, si el estudiante la indicó. */
    courseId: uuid("course_id").references(() => courses.id, {
      onDelete: "set null",
    }),
    subject: text("subject"),
    message: text("message").notNull(),
    status: contactStatusEnum("status").notNull().default("nuevo"),
    reply: text("reply"),
    readAt: timestamp("read_at", { withTimezone: true }),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    repliedBy: uuid("replied_by").references(() => users.id, {
      onDelete: "set null",
    }),
    /** Antispam: SHA-256 de la IP para limitación de frecuencia. */
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("contact_messages_status_idx").on(t.status),
    index("contact_messages_ip_idx").on(t.ipHash, t.createdAt),
  ],
);

/* ------------------------------------------------------------------ */
/* site_settings — configuración global clave → valor (JSON)           */
/* ------------------------------------------------------------------ */

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

/* ------------------------------------------------------------------ */
/* audit_logs — bitácora de acciones administrativas                   */
/* ------------------------------------------------------------------ */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorEmail: text("actor_email"),
    actorRole: text("actor_role"),
    /** Catálogo de acciones: ver src/lib/audit.ts */
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    summary: text("summary"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_logs_created_at_idx").on(t.createdAt),
    index("audit_logs_actor_idx").on(t.actorId),
    index("audit_logs_entity_idx").on(t.entity, t.entityId),
  ],
);

/* ------------------------------------------------------------------ */
/* content_versions — historial de versiones por contenido             */
/* ------------------------------------------------------------------ */

export const contentVersions = pgTable(
  "content_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entity: text("entity").notNull(),
    entityId: uuid("entity_id").notNull(),
    version: integer("version").notNull(),
    /** Snapshot completo del registro en esa versión. */
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    changeNote: text("change_note"),
    changedBy: uuid("changed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("content_versions_entity_version_key").on(
      t.entity,
      t.entityId,
      t.version,
    ),
  ],
);

/* ------------------------------------------------------------------ */
/* Relaciones (Drizzle)                                                */
/* ------------------------------------------------------------------ */

export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(userSessions),
  profile: one(professorProfile),
  auditEvents: many(auditLogs),
  replies: many(contactMessages),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const professorProfileRelations = relations(
  professorProfile,
  ({ one }) => ({
    user: one(users, {
      fields: [professorProfile.userId],
      references: [users.id],
    }),
  }),
);

export const coursesRelations = relations(courses, ({ many }) => ({
  materials: many(courseMaterials),
  announcements: many(courseAnnouncements),
  messages: many(contactMessages),
}));

export const courseMaterialsRelations = relations(
  courseMaterials,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseMaterials.courseId],
      references: [courses.id],
    }),
  }),
);

export const courseAnnouncementsRelations = relations(
  courseAnnouncements,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseAnnouncements.courseId],
      references: [courses.id],
    }),
  }),
);

export const contactMessagesRelations = relations(
  contactMessages,
  ({ one }) => ({
    course: one(courses, {
      fields: [contactMessages.courseId],
      references: [courses.id],
    }),
    replayer: one(users, {
      fields: [contactMessages.repliedBy],
      references: [users.id],
    }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

/* ------------------------------------------------------------------ */
/* Tipos derivados                                                     */
/* ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type ProfessorProfile = typeof professorProfile.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type CourseAnnouncement = typeof courseAnnouncements.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ContentVersion = typeof contentVersions.$inferSelect;

export type NewCourse = typeof courses.$inferInsert;
export type NewCourseMaterial = typeof courseMaterials.$inferInsert;
export type NewCourseAnnouncement = typeof courseAnnouncements.$inferInsert;
export type NewContactMessage = typeof contactMessages.$inferInsert;
