"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronDown,
  Loader2,
  LogIn,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  idleActionState,
  type ActionState,
} from "@/lib/action-state";
import { loginAction } from "@/server/actions/auth";
import {
  createCourseAction,
  updateCourseAction,
} from "@/server/actions/courses";
import { createMaterialAction } from "@/server/actions/materials";
import { createAnnouncementAction } from "@/server/actions/announcements";
import { createUserAction } from "@/server/actions/users";
import {
  replyToMessageAction,
  submitContactMessageAction,
} from "@/server/actions/messages";
import {
  sendTestEmailAction,
  updateProfessorProfileAction,
  updateSiteSettingsAction,
} from "@/server/actions/settings";
import { SITE_SETTING_KEYS } from "@/lib/settings-keys";
import {
  ANNOUNCEMENT_KIND_LABELS,
  COURSE_LEVEL_LABELS,
  MATERIAL_TYPE_LABELS,
  ROLE_LABELS,
} from "@/lib/format";
import type {
  AnnouncementKind,
  Course,
  CourseLevel,
  CourseSession,
  MaterialType,
  ProfessorProfile,
} from "@/db/schema";
import { RichTextEditor } from "@/components/admin/rich-editor";
import { FileUploadField } from "@/components/admin/upload";

/* ------------------------------------------------------------------ */
/* Primitivas de formulario (tema oscuro del panel)                    */
/* ------------------------------------------------------------------ */

const inputClasses =
  "w-full rounded-xl border border-line bg-lift px-3.5 py-2.5 text-sm text-cream placeholder:text-muted/70 transition focus:border-brass/60 focus:outline-none focus:ring-2 focus:ring-brass/20";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-sand">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClasses} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea {...props} className={`${inputClasses} min-h-24`} />;
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClasses} appearance-none`}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  description,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-line bg-lift/50 px-3.5 py-3">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 h-4 w-4 rounded border-line bg-lift accent-[#dca63f]"
      />
      <span>
        <span className="block text-sm font-medium text-cream">{label}</span>
        {description ? (
          <span className="block text-[11px] text-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

function SubmitButton({
  children,
  icon: Icon = Check,
  pendingLabel = "Guardando…",
}: {
  children: ReactNode;
  icon?: typeof Check;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" strokeWidth={2} />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

function ActionMessage({
  state,
  successText = "Cambios guardados correctamente.",
}: {
  state: ActionState;
  successText?: string;
}) {
  if (state.status === "idle") return null;
  if (state.status === "error") {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-clay/40 bg-clay/10 px-3.5 py-2.5 text-xs text-clay">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {state.error}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 rounded-xl border border-sage/40 bg-sage/10 px-3.5 py-2.5 text-xs text-sage">
      <Check className="h-3.5 w-3.5" /> {successText}
    </p>
  );
}

/** Contenedor plegable "Nuevo …" usado en las páginas de contenido. */
function CollapsibleForm({
  buttonLabel,
  title,
  children,
}: {
  buttonLabel: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90"
      >
        <Plus
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        />
        {buttonLabel}
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-2xl border border-line bg-panel">
            <p className="border-b border-line px-6 py-4 font-display text-lg font-medium text-cream">
              {title}
            </p>
            <div className="px-6 py-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function useResetOnSuccess(state: ActionState) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);
  return formRef;
}

/**
 * Contador que remonta los sub-componentes con estado (editor de
 * horarios, editor enriquecido, zona de subida) tras un alta con
 * éxito. Usa el patrón oficial de «ajustar estado durante el render»
 * en lugar de efectos en cascada.
 */
function useSuccessEdition(state: ActionState): number {
  const [edition, setEdition] = useState(0);
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.status === "success") setEdition((n) => n + 1);
  }
  return edition;
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(loginAction, idleActionState);
  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Correo institucional">
        <TextInput
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nombre@aula.edu"
        />
      </Field>
      <Field label="Contraseña">
        <TextInput
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>
      <ActionMessage state={state} />
      <LoginSubmit />
    </form>
  );
}

function LoginSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brass px-4 py-3 text-sm font-semibold text-night transition hover:bg-brass/90 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      {pending ? "Verificando…" : "Entrar al panel"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Editor de horario semanal (sesiones día/hora/aula)                  */
/* ------------------------------------------------------------------ */

const WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

function ScheduleEditor({
  defaultSessions = [],
}: {
  defaultSessions?: CourseSession[];
}) {
  const [sessions, setSessions] = useState<CourseSession[]>(defaultSessions);

  function addSession() {
    setSessions((prev) => [
      ...prev,
      { day: "Lunes", start: "08:00", end: "10:00", room: "" },
    ]);
  }

  function updateSession(index: number, patch: Partial<CourseSession>) {
    setSessions((prev) =>
      prev.map((session, i) =>
        i === index ? { ...session, ...patch } : session,
      ),
    );
  }

  function removeSession(index: number) {
    setSessions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input
        type="hidden"
        name="schedule"
        value={JSON.stringify(sessions)}
      />
      <span className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-sand">
          Horario semanal
        </span>
        <button
          type="button"
          onClick={addSession}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[11px] text-sand transition hover:border-brass/50 hover:text-brass"
        >
          <Plus className="h-3 w-3" /> Añadir sesión
        </button>
      </span>
      {sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-3.5 py-4 text-center text-xs text-muted">
          Sin sesiones definidas. Añade días, horas y aulas del curso.
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_auto_auto_1fr_auto] items-center gap-2 rounded-xl border border-line bg-lift/50 px-2.5 py-2"
            >
              <select
                value={session.day}
                onChange={(event) =>
                  updateSession(index, { day: event.target.value })
                }
                className="rounded-lg border border-line bg-lift px-2 py-1.5 text-xs text-cream focus:border-brass/60 focus:outline-none"
              >
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={session.start}
                onChange={(event) =>
                  updateSession(index, { start: event.target.value })
                }
                className="rounded-lg border border-line bg-lift px-2 py-1.5 text-xs text-cream focus:border-brass/60 focus:outline-none"
              />
              <input
                type="time"
                value={session.end}
                onChange={(event) =>
                  updateSession(index, { end: event.target.value })
                }
                className="rounded-lg border border-line bg-lift px-2 py-1.5 text-xs text-cream focus:border-brass/60 focus:outline-none"
              />
              <input
                value={session.room ?? ""}
                onChange={(event) =>
                  updateSession(index, { room: event.target.value })
                }
                placeholder="Aula / lab."
                className="rounded-lg border border-line bg-lift px-2 py-1.5 text-xs text-cream placeholder:text-muted/70 focus:border-brass/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeSession(index)}
                title="Quitar sesión"
                className="rounded-lg p-1.5 text-muted transition hover:text-clay"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campos de formulario compartidos por crear/editar curso             */
/* ------------------------------------------------------------------ */

function CourseFields({ course }: { course?: Course }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código" hint="Único, p. ej. QU-101">
          <TextInput name="code" required placeholder="QU-101" defaultValue={course?.code} />
        </Field>
        <Field label="Título">
          <TextInput
            name="title"
            required
            placeholder="Química General I"
            defaultValue={course?.title}
          />
        </Field>
        <Field label="Nivel universitario">
          <Select name="level" defaultValue={course?.level ?? "grado"}>
            {(Object.keys(COURSE_LEVEL_LABELS) as CourseLevel[]).map(
              (level) => (
                <option key={level} value={level}>
                  {COURSE_LEVEL_LABELS[level]}
                </option>
              ),
            )}
          </Select>
        </Field>
        <Field label="Período / semestre">
          <TextInput name="term" placeholder="2026-I" defaultValue={course?.term ?? ""} />
        </Field>
        <Field label="Créditos">
          <TextInput
            name="credits"
            type="number"
            min={0}
            placeholder="4"
            defaultValue={course?.credits ?? undefined}
          />
        </Field>
        <Field label="Aula principal">
          <TextInput name="room" placeholder="Aula Q-12" defaultValue={course?.room ?? ""} />
        </Field>
      </div>
      <ScheduleEditor defaultSessions={course?.schedule ?? []} />
      <RichTextEditor
        name="description"
        label="Descripción general"
        hint="Admite **negrita**, *cursiva*, sub/superíndices (H~2~O, Ca^2+^), enlaces, listas y `fórmulas`."
        placeholder="Síntesis del curso, prerrequisitos, metodología y sistema de evaluación…"
        defaultValue={course?.description ?? ""}
      />
    </>
  );
}

export function CreateCourseForm() {
  const [state, formAction] = useActionState(createCourseAction, idleActionState);
  const formRef = useResetOnSuccess(state);
  const edition = useSuccessEdition(state);

  return (
    <CollapsibleForm buttonLabel="Nueva asignatura" title="Registrar asignatura">
      <form ref={formRef} action={formAction} className="space-y-4" key={edition}>
        <CourseFields />
        <Checkbox
          name="publish"
          label="Publicar de inmediato"
          description="Si no se marca, la asignatura queda como borrador."
        />
        <ActionMessage state={state} />
        <SubmitButton icon={Plus}>Crear asignatura</SubmitButton>
      </form>
    </CollapsibleForm>
  );
}

/** Editor completo de una asignatura existente. */
export function EditCourseForm({ course }: { course: Course }) {
  const [state, formAction] = useActionState(updateCourseAction, idleActionState);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={course.id} />
      <CourseFields course={course} />
      <ActionMessage state={state} successText="Asignatura actualizada (nueva versión registrada)." />
      <SubmitButton pendingLabel="Guardando cambios…">
        Guardar cambios
      </SubmitButton>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Materiales                                                          */
/* ------------------------------------------------------------------ */

type CourseOption = { id: string; code: string; title: string };

export function CreateMaterialForm({ courses }: { courses: CourseOption[] }) {
  const [state, formAction] = useActionState(createMaterialAction, idleActionState);
  const formRef = useResetOnSuccess(state);
  const edition = useSuccessEdition(state);

  return (
    <CollapsibleForm buttonLabel="Nuevo material" title="Añadir material al repositorio">
      <form ref={formRef} action={formAction} className="space-y-4" key={edition}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Asignatura">
            <Select name="courseId" required defaultValue="">
              <option value="" disabled>
                Selecciona…
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Categoría">
            <Select name="type" defaultValue="apunte">
              {(Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {MATERIAL_TYPE_LABELS[type]}
                  </option>
                ),
              )}
            </Select>
          </Field>
          <Field label="Título">
            <TextInput
              name="title"
              required
              placeholder="Guía de prácticas Nº2 — Titulación ácido-base"
            />
          </Field>
          <Field label="Unidad / semana">
            <TextInput name="unit" placeholder="Semana 4" />
          </Field>
        </div>

        <Field
          label="Archivo (Storage restringido)"
          hint="Se sirve únicamente a través de la ruta protegida /archivos según el estado del material."
        >
          <FileUploadField />
        </Field>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted">
          <span className="h-px flex-1 bg-line" /> o enlaza un recurso externo
          <span className="h-px flex-1 bg-line" />
        </div>

        <Field label="URL externa" hint="Solo si no subiste un archivo arriba.">
          <TextInput
            name="url"
            type="url"
            placeholder="https://repositorio.universidad.edu/…"
          />
        </Field>

        <Field label="Descripción">
          <TextInput
            name="description"
            placeholder="Qué cubre este material…"
          />
        </Field>

        <Checkbox
          name="publish"
          label="Publicar de inmediato"
          description="Visible públicamente si la asignatura también está publicada."
        />
        <ActionMessage state={state} />
        <SubmitButton icon={Plus}>Guardar material</SubmitButton>
      </form>
    </CollapsibleForm>
  );
}

/* ------------------------------------------------------------------ */
/* Avisos                                                              */
/* ------------------------------------------------------------------ */

export function CreateAnnouncementForm({
  courses,
}: {
  courses: CourseOption[];
}) {
  const [state, formAction] = useActionState(createAnnouncementAction, idleActionState);
  const formRef = useResetOnSuccess(state);
  const edition = useSuccessEdition(state);

  return (
    <CollapsibleForm buttonLabel="Nuevo aviso" title="Publicar aviso">
      <form ref={formRef} action={formAction} className="space-y-4" key={edition}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título">
            <TextInput
              name="title"
              required
              placeholder="Examen parcial — Unidad 3"
            />
          </Field>
          <Field
            label="Asignatura"
            hint="Déjalo en «General» para avisar a todo el aula."
          >
            <Select name="courseId" defaultValue="">
              <option value="">General</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo de aviso">
            <Select name="kind" defaultValue="general">
              {(Object.keys(ANNOUNCEMENT_KIND_LABELS) as AnnouncementKind[]).map(
                (kind) => (
                  <option key={kind} value={kind}>
                    {ANNOUNCEMENT_KIND_LABELS[kind]}
                  </option>
                ),
              )}
            </Select>
          </Field>
          <Field label="Fecha del evento" hint="Opcional: día del examen, entrega o sesión.">
            <TextInput name="eventDate" type="date" />
          </Field>
        </div>

        <RichTextEditor
          name="body"
          label="Contenido del aviso"
          hint="Publicación rápida con notación química básica (H~2~O, SO~4~^2-^) y enlaces."
          placeholder="Detalles del aviso para los estudiantes…"
          rows={5}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox
            name="pinned"
            label="Fijar al inicio"
            description="Aparece primero en el tablón público."
          />
          <Checkbox
            name="publish"
            label="Publicar de inmediato"
            description="Si no se marca, queda como borrador."
          />
        </div>
        <ActionMessage state={state} />
        <SubmitButton icon={Plus}>Publicar aviso</SubmitButton>
      </form>
    </CollapsibleForm>
  );
}

/* ------------------------------------------------------------------ */
/* Cuentas                                                             */
/* ------------------------------------------------------------------ */

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUserAction, idleActionState);
  const formRef = useResetOnSuccess(state);

  return (
    <CollapsibleForm buttonLabel="Nueva cuenta" title="Crear cuenta individual">
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo">
            <TextInput name="fullName" required placeholder="Ana Quispe" />
          </Field>
          <Field label="Correo del aula">
            <TextInput
              name="email"
              type="email"
              required
              placeholder="ana@aula.edu"
            />
          </Field>
          <Field label="Rol académico">
            <Select name="role" defaultValue="editor">
              <option value="editor">{ROLE_LABELS.editor}</option>
              <option value="administrador">
                {ROLE_LABELS.administrador}
              </option>
            </Select>
          </Field>
          <Field
            label="Contraseña inicial"
            hint="Mínimo 8 caracteres. Pídele que la cambie al ingresar."
          >
            <TextInput
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>
        </div>
        <ActionMessage state={state} />
        <SubmitButton icon={Plus}>Crear cuenta</SubmitButton>
      </form>
    </CollapsibleForm>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeja de consultas — respuesta                                    */
/* ------------------------------------------------------------------ */

export function ReplyForm({ messageId }: { messageId: string }) {
  const [state, formAction] = useActionState(replyToMessageAction, idleActionState);
  const formRef = useResetOnSuccess(state);

  return (
    <form ref={formRef} action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="messageId" value={messageId} />
      <TextArea
        name="reply"
        required
        minLength={2}
        maxLength={2000}
        placeholder="Redacta la respuesta para el estudiante…"
      />
      <div className="flex items-center gap-3">
        <SubmitButton icon={Send} pendingLabel="Guardando…">
          Registrar respuesta
        </SubmitButton>
        <ActionMessage state={state} successText="Respuesta registrada." />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Formulario público de consultas (tema claro del sitio)              */
/* ------------------------------------------------------------------ */

const lightInput =
  "w-full rounded-xl border border-ink/15 bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

export function ContactForm({
  courses,
  issuedAt,
}: {
  courses: CourseOption[];
  issuedAt: number;
}) {
  const [state, formAction] = useActionState(
    submitContactMessageAction,
    idleActionState,
  );
  const formRef = useResetOnSuccess(state);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center">
        <Check className="mx-auto h-6 w-6 text-gold-deep" />
        <p className="mt-3 font-display text-xl font-medium">
          Consulta enviada
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
          Gracias por escribir. Revisaré tu mensaje y te responderé al correo
          indicado lo antes posible.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Antispam: honeypot invisible + marca temporal de render */}
      <input type="hidden" name="issuedAt" value={issuedAt} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-soft">
            Nombre
          </span>
          <input name="name" required maxLength={90} placeholder="Tu nombre" className={lightInput} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-soft">
            Correo
          </span>
          <input
            name="email"
            type="email"
            required
            placeholder="tu@correo.edu"
            className={lightInput}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-soft">
            Asignatura (opcional)
          </span>
          <select name="courseId" defaultValue="" className={lightInput}>
            <option value="">No aplica / otra</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-soft">
            Asunto (opcional)
          </span>
          <input name="subject" maxLength={140} placeholder="Duda sobre la guía 2…" className={lightInput} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">
          Tu consulta
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Escribe tu duda con el mayor detalle posible: ejercicio, tema, qué has intentado…"
          className={`${lightInput} min-h-28`}
        />
      </label>

      {state.status === "error" ? (
        <p className="flex items-start gap-2 rounded-xl border border-clay/40 bg-clay/10 px-3.5 py-2.5 text-xs text-clay">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <ContactSubmit />
      <p className="text-[11px] leading-relaxed text-ink-soft">
        Formulario con protección antispam (honeypot, trampa temporal y límite
        de frecuencia por IP).
      </p>
    </form>
  );
}

function ContactSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-gold-deep disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {pending ? "Enviando…" : "Enviar consulta"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Papelera — purgado definitivo con confirmación                      */
/* ------------------------------------------------------------------ */

export function ConfirmSubmitButton({
  message,
  children,
  className = "",
}: {
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function PurgeButton() {
  return (
    <ConfirmSubmitButton
      message="¿Purgar definitivamente este elemento? Se eliminará físicamente (y su archivo en Storage, si lo tiene). Esta acción no se puede deshacer."
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-clay/50 bg-clay/10 px-2.5 text-[11px] font-medium text-clay transition hover:bg-clay/20"
    >
      <Trash2 className="h-3.5 w-3.5" /> Purgar
    </ConfirmSubmitButton>
  );
}

/* ------------------------------------------------------------------ */
/* Ajustes del sitio y perfil docente                                  */
/* ------------------------------------------------------------------ */

const SITE_SETTING_LABELS: Record<
  (typeof SITE_SETTING_KEYS)[number],
  { label: string; hint: string; multiline?: boolean; color?: boolean }
> = {
  site_title: {
    label: "Título del sitio",
    hint: "Se muestra como titular principal de la portada.",
  },
  site_tagline: {
    label: "Frase de presentación",
    hint: "Subtítulo bajo el titular.",
  },
  site_description: {
    label: "Descripción del aula",
    hint: "Texto de contexto para visitantes.",
    multiline: true,
  },
  academic_term: {
    label: "Período académico",
    hint: "Etiqueta visible en la portada, p. ej. 2026-I.",
  },
  brand_primary: {
    label: "Color primario institucional",
    hint: "Títulos, botones y detalles principales del sitio público.",
    color: true,
  },
  brand_accent: {
    label: "Color de acento institucional",
    hint: "Resaltes, números de sección y detalles editoriales.",
    color: true,
  },
  notify_email: {
    label: "Correo para alertas de consultas",
    hint: "Aquí llegan las notificaciones automáticas de nuevas consultas de estudiantes.",
  },
};

function ColorField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue || "#a4751f");
  const normalized = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#a4751f";
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        value={normalized}
        onChange={(event) => setValue(event.target.value)}
        className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-lift p-1"
        aria-label="Selector de color"
      />
      <input
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        pattern="#[0-9a-fA-F]{6}"
        placeholder="#a4751f"
        className={`${inputClasses} flex-1 font-mono`}
      />
      <span
        className="h-10 w-10 shrink-0 rounded-lg border border-line"
        style={{ backgroundColor: normalized }}
        aria-hidden="true"
      />
    </div>
  );
}

export function SiteSettingsForm({
  values,
}: {
  values: Record<string, string>;
}) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, idleActionState);

  return (
    <form action={formAction} className="space-y-4">
      {SITE_SETTING_KEYS.map((key) => {
        const meta = SITE_SETTING_LABELS[key];
        return (
          <Field key={key} label={meta.label} hint={meta.hint}>
            {meta.color ? (
              <ColorField name={key} defaultValue={values[key] ?? ""} />
            ) : meta.multiline ? (
              <TextArea name={key} defaultValue={values[key] ?? ""} />
            ) : (
              <TextInput name={key} defaultValue={values[key] ?? ""} />
            )}
          </Field>
        );
      })}
      <ActionMessage state={state} />
      <SubmitButton>Guardar ajustes</SubmitButton>
    </form>
  );
}

export function ProfessorProfileForm({
  profile,
}: {
  profile: ProfessorProfile | null;
}) {
  const [state, formAction] = useActionState(
    updateProfessorProfileAction,
    idleActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Encabezado profesional"
        hint="Grado y especialidad, p. ej. «Químico, Ph.D. en Química Orgánica»."
      >
        <TextInput
          name="headline"
          required
          defaultValue={profile?.headline ?? ""}
        />
      </Field>
      <Field label="Departamento / unidad académica">
        <TextInput
          name="department"
          defaultValue={profile?.department ?? ""}
          placeholder="Departamento de Química · Facultad de Ciencias"
        />
      </Field>
      <Field label="Biografía breve">
        <TextArea name="bio" defaultValue={profile?.bio ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Horario de atención">
          <TextInput
            name="officeHours"
            defaultValue={profile?.officeHours ?? ""}
            placeholder="Lun y mié · 10:00–12:00"
          />
        </Field>
        <Field label="Despacho">
          <TextInput
            name="office"
            defaultValue={profile?.office ?? ""}
            placeholder="Pabellón B · 204"
          />
        </Field>
        <Field label="Correo institucional público">
          <TextInput
            name="contactEmail"
            type="email"
            defaultValue={profile?.contactEmail ?? ""}
            placeholder="profesor@universidad.edu"
          />
        </Field>
      </div>
      <ActionMessage state={state} />
      <SubmitButton>Guardar perfil</SubmitButton>
    </form>
  );
}

function TestSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl border border-brass/40 bg-brass/10 px-4 py-2.5 text-sm font-semibold text-brass transition hover:bg-brass/20 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {pending ? "Enviando…" : "Enviar correo de prueba"}
    </button>
  );
}

/** Botón «Enviar correo de prueba» (notificaciones Resend). */
export function TestEmailButton() {
  const [state, formAction] = useActionState(sendTestEmailAction, idleActionState);
  return (
    <form action={formAction} className="space-y-3">
      <TestSubmitButton />
      <ActionMessage
        state={state}
        successText="Correo de prueba enviado (revisa el buzón o la consola si está en modo simulado)."
      />
    </form>
  );
}

/* Re-exportaciones auxiliares */
export { ChevronDown, CalendarClock };
