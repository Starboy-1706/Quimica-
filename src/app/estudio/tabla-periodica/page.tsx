import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ELEMENTS } from "@/lib/chemistry/elements";
import {
  getProfessorPublicProfile,
  getSiteSettingsMap,
} from "@/server/queries";
import {
  brandVars,
  PublicFooter,
  PublicNav,
} from "@/components/public/chrome";
import { PeriodicTable } from "@/components/public/periodic-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tabla periódica interactiva",
  description:
    "Tabla periódica interactiva con los 118 elementos: masa atómica, configuración electrónica, electronegatividad de Pauling, familia química y datos curiosos. Busca, filtra y estudia.",
  alternates: { canonical: "/estudio/tabla-periodica" },
};

const CONCEPTS = [
  {
    term: "Periodo",
    detail:
      "Las filas horizontales (1–7). Indican el nivel de energía máximo ocupado por los electrones del átomo.",
  },
  {
    term: "Grupo",
    detail:
      "Las columnas verticales (1–18). Los elementos de un grupo comparten configuración externa y, por eso, propiedades parecidas.",
  },
  {
    term: "Bloque",
    detail:
      "Regiones según el orbital que se está llenando: s (grupos 1–2), p (13–18), d (3–12) y f (lantánidos y actínidos).",
  },
  {
    term: "Electronegatividad",
    detail:
      "La tendencia de un átomo a atraer los electrones de un enlace. Crece hacia arriba y hacia la derecha: el flúor (3,98) es el máximo.",
  },
];

export default async function PeriodicTablePage() {
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
            {institutionName} · Herramienta gratuita
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Tabla periódica interactiva
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Los 118 elementos de la IUPAC con sus datos esenciales. Toca
            cualquier casilla para abrir su ficha, busca por nombre, símbolo o
            número atómico, y filtra por familia química.
          </p>
          <p
            className="pointer-events-none absolute -top-6 right-0 hidden select-none font-display text-[6.5rem] font-black italic leading-none text-(--brand)/[0.05] lg:block"
            aria-hidden="true"
          >
            {ELEMENTS.length}
          </p>
        </header>

        <PeriodicTable />

        {/* ── Conceptos clave (contenido educativo + SEO) ─────────────── */}
        <section aria-labelledby="conceptos-h" className="mt-16">
          <h2
            id="conceptos-h"
            className="border-b-2 border-ink pb-3 font-display text-2xl font-semibold"
          >
            Cómo se lee la tabla
          </h2>
          <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            {CONCEPTS.map((concept) => (
              <div key={concept.term}>
                <dt className="flex items-center gap-2.5 font-display text-lg font-semibold">
                  <span className="h-px w-6 bg-(--brand)" aria-hidden="true" />
                  {concept.term}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {concept.detail}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 border-t border-ink/10 pt-5 text-xs leading-relaxed text-ink-soft">
            Masas atómicas estándar de la IUPAC redondeadas a tres decimales;
            para elementos sin isótopos estables se muestra entre corchetes la
            masa del isótopo más estable. Configuraciones electrónicas en
            notación abreviada de gas noble y electronegatividades en la
            escala de Pauling.
          </p>
        </section>
      </main>

      <PublicFooter profile={profile} settings={settings} />
    </div>
  );
}
