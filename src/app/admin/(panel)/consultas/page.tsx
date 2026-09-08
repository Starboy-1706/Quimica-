import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import {
  Archive,
  BookMarked,
  CheckCheck,
  Inbox,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import {
  archiveMessageAction,
  markMessageReadAction,
} from "@/server/actions/messages";
import { requirePageUser } from "@/lib/auth/session";
import {
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_TONES,
  formatDateTime,
} from "@/lib/format";
import { ReplyForm } from "@/components/admin/forms";
import {
  ActionFormButton,
  Badge,
  EmptyState,
  PageHeader,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Consultas" };
export const dynamic = "force-dynamic";

const FILTER_TABS = [
  ["", "Todas"],
  ["nuevo", "Nuevas"],
  ["leido", "Leídas"],
  ["respondido", "Respondidas"],
  ["archivado", "Archivadas"],
] as const;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  await requirePageUser();
  const { estado } = await searchParams;

  const validStatus = ["nuevo", "leido", "respondido", "archivado"] as const;
  const activeFilter = validStatus.find((s) => s === estado);

  const messages = await db.query.contactMessages.findMany({
    where: activeFilter ? eq(contactMessages.status, activeFilter) : undefined,
    orderBy: [desc(contactMessages.createdAt)],
    limit: 100,
    with: { course: { columns: { code: true, title: true } } },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Estudiantes · Bandeja de entrada"
        title="Consultas estudiantiles"
        description="Dudas enviadas desde el formulario público, protegidas con antispam (honeypot, trampa temporal y límite por IP). Marca, responde y archiva."
      />

      {/* Filtros por estado */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {FILTER_TABS.map(([value, label]) => (
          <a
            key={value}
            href={value ? `/admin/consultas?estado=${value}` : "/admin/consultas"}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              (activeFilter ?? "") === value
                ? "border-brass bg-brass/15 text-brass"
                : "border-line text-sand hover:border-brass/40 hover:text-brass"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Bandeja tranquila"
          description="No hay consultas en este estado. Las nuevas aparecen aquí automáticamente."
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className="animate-rise rounded-2xl border border-line bg-panel"
            >
              <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-6 py-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lift font-display text-xs font-semibold text-brass">
                  {message.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-cream">
                    {message.name}
                  </p>
                  <p className="text-[11px] text-muted">{message.email}</p>
                </div>
                <Badge tone={CONTACT_STATUS_TONES[message.status]}>
                  {CONTACT_STATUS_LABELS[message.status]}
                </Badge>
                {message.course ? (
                  <Badge tone="slate">
                    <BookMarked className="h-3 w-3" />
                    {message.course.code}
                  </Badge>
                ) : null}
                {message.subject ? (
                  <span className="text-xs italic text-sand">
                    «{message.subject}»
                  </span>
                ) : null}
                <time className="ml-auto font-mono text-[10px] text-muted">
                  {formatDateTime(message.createdAt)}
                </time>
              </div>

              <div className="px-6 py-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-sand">
                  {message.message}
                </p>

                {message.reply ? (
                  <div className="mt-4 rounded-xl border border-sage/25 bg-sage/[0.06] px-4 py-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-sage">
                      Respuesta registrada · {formatDateTime(message.repliedAt)}
                    </p>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-cream/90">
                      {message.reply}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {message.status === "nuevo" ? (
                    <form action={markMessageReadAction.bind(null, message.id)}>
                      <ActionFormButton title="Marcar como leída">
                        <CheckCheck className="h-3.5 w-3.5" /> Marcar leída
                      </ActionFormButton>
                    </form>
                  ) : null}
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject ?? "Tu consulta"}`)}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[11px] font-medium text-sand transition hover:border-brass/50 hover:text-brass"
                  >
                    <Mail className="h-3.5 w-3.5" /> Responder por correo
                  </a>
                  {message.status !== "archivado" ? (
                    <form action={archiveMessageAction.bind(null, message.id)}>
                      <ActionFormButton title="Archivar consulta">
                        <Archive className="h-3.5 w-3.5" /> Archivar
                      </ActionFormButton>
                    </form>
                  ) : null}
                </div>

                {message.status !== "archivado" && !message.reply ? (
                  <details className="group mt-4 rounded-xl border border-line bg-lift/30">
                    <summary className="cursor-pointer list-none px-4 py-2.5 text-xs font-medium text-sand transition hover:text-brass [&::-webkit-details-marker]:hidden">
                      Registrar respuesta interna (queda en el historial de la consulta)
                    </summary>
                    <div className="border-t border-line px-4 pb-4">
                      <ReplyForm messageId={message.id} />
                    </div>
                  </details>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-panel p-4 text-xs text-muted">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
        <p className="leading-relaxed">
          El antispam descarta automáticamente bots y envíos abusivos; esos
          eventos quedan en la bitácora como{" "}
          <code className="rounded bg-lift px-1.5 py-0.5 font-mono text-[10px]">
            consulta.descartada_antispam
          </code>
          . Las respuestas registradas aquí son internas (historial); para
          escribir al estudiante usa «Responder por correo».
        </p>
      </div>
    </div>
  );
}
