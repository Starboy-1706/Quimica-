CREATE TYPE "public"."announcement_kind" AS ENUM('general', 'examen', 'cambio_aula', 'entrega');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('nuevo', 'leido', 'respondido', 'archivado');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('grado', 'master', 'doctorado');--> statement-breakpoint
ALTER TYPE "public"."material_type" ADD VALUE 'presentacion' BEFORE 'enlace';--> statement-breakpoint
ALTER TYPE "public"."material_type" ADD VALUE 'ejercicios' BEFORE 'enlace';--> statement-breakpoint
ALTER TYPE "public"."material_type" ADD VALUE 'syllabus' BEFORE 'enlace';--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"course_id" uuid,
	"subject" text,
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'nuevo' NOT NULL,
	"reply" text,
	"read_at" timestamp with time zone,
	"replied_at" timestamp with time zone,
	"replied_by" uuid,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "level" SET DEFAULT 'grado'::"public"."course_level";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "level" SET DATA TYPE "public"."course_level" USING "level"::"public"."course_level";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course_announcements" ADD COLUMN "kind" "announcement_kind" DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "course_announcements" ADD COLUMN "event_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN "file_key" text;--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "room" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "schedule" jsonb;--> statement-breakpoint
ALTER TABLE "professor_profile" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_replied_by_users_id_fk" FOREIGN KEY ("replied_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_messages_status_idx" ON "contact_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_messages_ip_idx" ON "contact_messages" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "course_materials_file_key_key" ON "course_materials" USING btree ("file_key");