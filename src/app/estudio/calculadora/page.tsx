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
import { MolarCalculator } from "@/components/public/molar-calculator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calculadora de masa molar",
  description:
    "Calcula la masa molar de cualquier compuesto (H2SO4, Ca(OH)2, CuSO4·5H2O…) con desglose porcentual por elemento y conversor gramos ↔ moles ↔ partículas con la constante de Avogadro.",
  alternates: { canonical: "/estudio/calculadora" },
};

export default async function MolarCalculatorPage() {
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
            Calculadora de masa molar
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Escribe una unidad fórmula y obtén al instante su masa molar, la
            composición porcentual de cada elemento y la conversión entre
            gramos, moles y partículas. Sin calculadora, sin cuentas a mano.
          </p>
          <p
            className="pointer-events-none absolute -top-6 right-0 hidden select-none font-display text-[6.5rem] font-black italic leading-none text-(--brand)/[0.05] lg:block"
            aria-hidden="true"
          >
            g/mol
          </p>
        </header>

        <MolarCalculator />

        {/* ── Recordatorio teórico ─────────────────────────────────────── */}
        <section aria-labelledby="teoria-h" className="mt-16">
          <h2
            id="teoria-h"
            className="border-b-2 border-ink pb-3 font-display text-2xl font-semibold"
          >
            ¿Qué es la masa molar?
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
            <p>
              La <strong className="font-semibold text-ink">masa molar (M)</strong> de
              un compuesto es la masa de un mol de sus unidades fórmula y se
              expresa en gramos por mol (g/mol). Se calcula sumando las masas
              atómicas de todos los átomos de la fórmula, multiplicadas por
              sus subíndices: para H₂SO₄, 2×1,008 + 32,06 + 4×15,999 =
              98,079 g/mol.
            </p>
            <p>
              Con ella se convierte entre{" "}
              <strong className="font-semibold text-ink">moles y gramos</strong>{" "}
              (n = m ÷ M) y, usando la constante de Avogadro, se estima el
              número de moléculas reales presentes en una muestra. Es la
              operación base de toda la estequiometría: reactivos, productos,
              rendimiento y concentraciones parten de aquí.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter profile={profile} settings={settings} />
    </div>
  );
}
