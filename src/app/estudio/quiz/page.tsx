import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getProfessorPublicProfile,
  getSiteSettingsMap,
} from "@/server/queries";
import {
  brandVars,
  PublicFooter,
  PublicNav,
} from "@/components/public/chrome";
import { ChemistryQuiz } from "@/components/public/quiz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quiz de práctica",
  description:
    "Quiz interactivo de la tabla periódica: rondas de 10 preguntas sobre símbolos, nombres, números atómicos y familias químicas. Dos niveles y corrección instantánea.",
  alternates: { canonical: "/estudio/quiz" },
};

export default async function QuizPage() {
  const [settings, profile] = await Promise.all([
    getSiteSettingsMap(),
    getProfessorPublicProfile(),
  ]);

  const institutionName =
    profile?.department ?? settings.institution_name ?? "Departamento de Química";

  return (
    <div className="min-h-screen bg-paper text-ink" style={brandVars(settings)}>
      <PublicNav active="estudio" profile={profile} settings={settings} />

      <main id="contenido" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <nav aria-label="Migas de pan">
          <Link
            href="/estudio"
            className="inline-flex items-center gap-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft transition hover:text-(--brand)"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Centro de estudio
          </Link>
        </nav>

        <header className="relative mt-6 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-(--brand)">
            {institutionName} · Práctica sin registro
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Quiz de la tabla periódica
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Rondas de 10 preguntas generadas al vuelo: símbolos, nombres,
            números atómicos y familias químicas. Corrección al instante y
            repaso de fallos al final. Nadie ve tu nota: es para practicar.
          </p>
          <p
            className="pointer-events-none absolute -top-6 right-0 hidden select-none font-display text-[6.5rem] font-black italic leading-none text-(--brand)/[0.05] lg:block"
            aria-hidden="true"
          >
            A/B
          </p>
        </header>

        <ChemistryQuiz />
      </main>

      <PublicFooter profile={profile} settings={settings} />
    </div>
  );
}
