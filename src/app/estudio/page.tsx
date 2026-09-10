import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  FlaskConical,
  GraduationCap,
  Table2,
} from "lucide-react";
import { CATEGORIES } from "@/lib/chemistry/elements";
import {
  getProfessorPublicProfile,
  getSiteSettingsMap,
} from "@/server/queries";
import {
  brandVars,
  PublicFooter,
  PublicNav,
} from "@/components/public/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Centro de estudio",
  description:
    "Herramientas interactivas de química para estudiar gratis: tabla periódica interactiva con los 118 elementos, calculadora de masa molar con conversor gramos-moles y quiz de práctica.",
  alternates: { canonical: "/estudio" },
};

const TOOLS = [
  {
    href: "/estudio/tabla-periodica",
    icon: Table2,
    ghost: "118",
    title: "Tabla periódica interactiva",
    description:
      "Los 118 elementos con masa atómica, configuración electrónica, electronegatividad y familia. Busca por nombre, símbolo o número atómico.",
    bullets: ["Búsqueda instantánea", "Filtro por 10 familias", "Datos curiosos"],
    cta: "Explorar la tabla",
  },
  {
    href: "/estudio/calculadora",
    icon: Calculator,
    ghost: "M",
    title: "Calculadora de masa molar",
    description:
      "Escribe una fórmula —H2SO4, Ca(OH)2, CuSO4·5H2O— y obtén su masa molar con desglose porcentual por elemento, además del conversor gramos ↔ moles ↔ partículas.",
    bullets: ["Paréntesis e hidratos", "Composición porcentual", "Con Avogadro incluido"],
    cta: "Calcular masas",
  },
  {
    href: "/estudio/quiz",
    icon: GraduationCap,
    ghost: "10",
    title: "Quiz de práctica",
    description:
      "Rondas de 10 preguntas generadas al vuelo: símbolos, nombres, números atómicos y familias químicas. Elige tu nivel, de los habituales a los 118.",
    bullets: ["Dos niveles", "Corrección al instante", "Repaso de fallos"],
    cta: "Ponte a prueba",
  },
] as const;

const CONSTANTS = [
  { symbol: "Nₐ", name: "Constante de Avogadro", value: "6,022 × 10²³ mol⁻¹" },
  { symbol: "R", name: "Constante de los gases", value: "0,082 atm·L·mol⁻¹·K⁻¹" },
  { symbol: "Vm", name: "Volumen molar (CNPT)", value: "22,4 L·mol⁻¹" },
  { symbol: "F", name: "Constante de Faraday", value: "96 485 C·mol⁻¹" },
  { symbol: "mₑ", name: "Masa del electrón", value: "9,109 × 10⁻³¹ kg" },
  { symbol: "c", name: "Velocidad de la luz", value: "2,998 × 10⁸ m·s⁻¹" },
];

export default async function StudyHubPage() {
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
        <header className="relative max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-(--brand)">
            {institutionName}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Centro de estudio
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Herramientas interactivas de química, gratuitas y sin registro:
            explora la tabla periódica, resuelve masas molares en segundos y
            entrena con un quiz antes del examen.
          </p>
          <p
            className="pointer-events-none absolute -top-6 right-0 hidden select-none font-display text-[6.5rem] font-black italic leading-none text-(--brand)/[0.05] lg:block"
            aria-hidden="true"
          >
            Lab
          </p>
        </header>

        {/* ── Herramientas ─────────────────────────────────────────── */}
        <section aria-label="Herramientas de estudio" className="mt-12">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TOOLS.map((tool, i) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="animate-rise group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/50 p-6 transition duration-200 hover:-translate-y-1 hover:border-(--brand) hover:shadow-[0_24px_50px_-30px_rgba(27,23,16,0.55)]"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span
                  className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[6rem] font-black italic leading-none text-(--brand)/[0.06] transition group-hover:text-(--brand)/10"
                  aria-hidden="true"
                >
                  {tool.ghost}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--brand) text-paper transition group-hover:scale-105">
                  <tool.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-xl font-semibold leading-snug">
                  {tool.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {tool.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Características">
                  {tool.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-full bg-ink/[0.05] px-2.5 py-1 font-mono text-[10px] text-ink-soft"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1.5 border-t border-ink/10 pt-4 text-sm font-semibold text-(--brand)">
                  {tool.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Constantes de cabecera de cuaderno ───────────────────── */}
        <section aria-labelledby="constantes-h" className="mt-16">
          <div className="flex items-center gap-3 border-b-2 border-ink pb-3">
            <FlaskConical className="h-5 w-5 text-(--brand)" aria-hidden="true" />
            <h2 id="constantes-h" className="font-display text-2xl font-semibold">
              Constantes que siempre caen
            </h2>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CONSTANTS.map((constant) => (
              <li
                key={constant.symbol + constant.name}
                className="rounded-xl border border-ink/10 bg-white/40 p-4"
              >
                <p className="font-display text-2xl font-black italic text-(--brand)">
                  {constant.symbol}
                </p>
                <p className="mt-1.5 text-[11px] font-medium leading-tight">
                  {constant.name}
                </p>
                <p className="mt-1 font-mono text-[10px] leading-tight text-ink-soft">
                  {constant.value}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Familias de la tabla (mini glosario) ─────────────────── */}
        <section aria-labelledby="familias-h" className="mt-16">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
            <h2 id="familias-h" className="font-display text-2xl font-semibold">
              Las familias de la tabla
            </h2>
            <Link
              href="/estudio/tabla-periodica"
              className="hidden shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-(--brand) transition hover:text-(--brand-2) sm:inline-flex"
            >
              Ver la tabla
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex items-start gap-3 border-b border-ink/[0.07] pb-4"
              >
                <span
                  className="mt-1 h-3.5 w-3.5 shrink-0 rounded"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-sm font-semibold">{category.label}</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                    {category.description}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <PublicFooter profile={profile} settings={settings} />
    </div>
  );
}
