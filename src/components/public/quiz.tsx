"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  CATEGORIES,
  ELEMENTS,
  categoryLabel,
  type ElementCategory,
  type PeriodicElement,
} from "@/lib/chemistry/elements";

type Mode = "habituales" | "completa";

/** Elementos de uso cotidiano en clase (periodos 1–4 + metales clásicos). */
const COMMON_Z = new Set<number>([
  ...Array.from({ length: 36 }, (_, i) => i + 1),
  47, 50, 53, 56, 78, 79, 80, 82, 92,
]);

const POOLS: Record<Mode, PeriodicElement[]> = {
  habituales: ELEMENTS.filter((el) => COMMON_Z.has(el.z)),
  completa: ELEMENTS,
};

type QuestionType =
  | "symbol-of"
  | "name-of"
  | "number-of"
  | "family-member"
  | "member-family";

type Question = {
  concept: string;
  prompt: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample<T>(list: T[], count: number): T[] {
  return shuffle(list).slice(0, count);
}

/** Distractores verosímiles: misma familia o vecinos en Z. */
function plausibleDistractors(
  answer: PeriodicElement,
  pool: PeriodicElement[],
  count: number,
): PeriodicElement[] {
  const candidates = pool.filter((el) => el.z !== answer.z);
  const sameFamily = candidates.filter((el) => el.category === answer.category);
  const neighbors = candidates.filter(
    (el) => Math.abs(el.z - answer.z) <= 8,
  );
  const ordered = [...shuffle(sameFamily), ...shuffle(neighbors)];
  const picked: PeriodicElement[] = [];
  for (const el of ordered) {
    if (picked.length >= count) break;
    if (!picked.some((p) => p.z === el.z)) picked.push(el);
  }
  for (const el of shuffle(candidates)) {
    if (picked.length >= count) break;
    if (!picked.some((p) => p.z === el.z)) picked.push(el);
  }
  return picked;
}

function buildQuestion(pool: PeriodicElement[]): Question {
  const types: QuestionType[] = [
    "symbol-of",
    "name-of",
    "number-of",
    "family-member",
    "member-family",
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "family-member") {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const members = pool.filter((el) => el.category === category.id);
    // Familias presentes en el pool (en "habituales" no hay lantánidos).
    const answer = members[Math.floor(Math.random() * members.length)];
    if (answer) {
      const distractors = sample(
        pool.filter((el) => el.category !== category.id),
        3,
      );
      const correct = shuffle([answer, ...distractors]);
      return {
        concept: "Familias químicas",
        prompt: (
          <>
            ¿Cuál de estos elementos es{" "}
            <strong className="text-(--brand)">{category.label.toLowerCase()}</strong>?
          </>
        ),
        options: correct.map((el) => `${el.symbol} — ${el.name}`),
        correctIndex: correct.findIndex((el) => el.z === answer.z),
        explanation: `${answer.name} (${answer.symbol}) pertenece a ${category.label.toLowerCase()}.`,
      };
    }
  }

  if (type === "member-family") {
    const answer = pool[Math.floor(Math.random() * pool.length)];
    const familyChoices = new Set<ElementCategory>([answer.category]);
    const others = shuffle(CATEGORIES.filter((c) => c.id !== answer.category));
    for (const cat of others) {
      if (familyChoices.size >= 4) break;
      familyChoices.add(cat.id);
    }
    const optionCats = shuffle([...familyChoices]);
    return {
      concept: "Familias químicas",
      prompt: (
        <>
          ¿A qué familia pertenece{" "}
          <strong className="text-(--brand)">
            {answer.name} ({answer.symbol})
          </strong>
          ?
        </>
      ),
      options: optionCats.map((id) => categoryLabel(id)),
      correctIndex: optionCats.indexOf(answer.category),
      explanation: `${answer.name} es ${categoryLabel(answer.category).toLowerCase()}, periodo ${answer.period}.`,
    };
  }

  const answer = pool[Math.floor(Math.random() * pool.length)];
  const distractors = plausibleDistractors(answer, pool, 3);
  const ordered = shuffle([answer, ...distractors]);
  const correctIndex = ordered.findIndex((el) => el.z === answer.z);

  if (type === "symbol-of") {
    return {
      concept: "Símbolos",
      prompt: (
        <>
          ¿Cuál es el símbolo de{" "}
          <strong className="text-(--brand)">{answer.name.toLowerCase()}</strong>?
        </>
      ),
      options: ordered.map((el) => el.symbol),
      correctIndex,
      explanation: `${answer.name} se simboliza ${answer.symbol}.`,
    };
  }

  if (type === "number-of") {
    return {
      concept: "Número atómico",
      prompt: (
        <>
          ¿Qué elemento tiene número atómico{" "}
          <strong className="text-(--brand)">Z = {answer.z}</strong>?
        </>
      ),
      options: ordered.map((el) => el.symbol),
      correctIndex,
      explanation: `Z = ${answer.z} corresponde a ${answer.name} (${answer.symbol}): ${answer.z} protones.`,
    };
  }

  return {
    concept: "Nombres",
    prompt: (
      <>
        ¿Qué elemento representa el símbolo{" "}
        <strong className="font-mono text-(--brand)">{answer.symbol}</strong>?
      </>
    ),
    options: ordered.map((el) => el.name),
    correctIndex,
    explanation: `${answer.symbol} es ${answer.name.toLowerCase()}.`,
  };
}

function buildRound(pool: PeriodicElement[], count: number): Question[] {
  return Array.from({ length: count }, () => buildQuestion(pool));
}

const ROUND_SIZE = 10;
const LETTERS = ["A", "B", "C", "D"];

function tier(score: number): { title: string; detail: string } {
  if (score === ROUND_SIZE)
    return { title: "¡Dominio total!", detail: "Nivel cátedra: la tabla no tiene secretos para ti." };
  if (score >= 8)
    return { title: "Excelente", detail: "Nivel laboratorio: muy sólido, afina los detalles." };
  if (score >= 6)
    return { title: "Buen trabajo", detail: "Repasa los fallos de abajo y repite la ronda." };
  if (score >= 4)
    return { title: "Vas por el camino", detail: "Explora la tabla interactiva unos minutos y vuelve." };
  return { title: "Toca estudiar", detail: "Nadie nace sabiéndose los 118: empieza por los habituales." };
}

/**
 * Quiz de práctica de la tabla periódica: rondas de 10 preguntas
 * generadas al vuelo (símbolos, nombres, números atómicos y familias).
 */
export function ChemistryQuiz() {
  const [mode, setMode] = useState<Mode>("habituales");
  const [phase, setPhase] = useState<"inicio" | "jugando" | "final">("inicio");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<
    Array<{ question: Question; picked: number }>
  >([]);

  const score = useMemo(
    () =>
      answers.filter((a) => a.picked === a.question.correctIndex).length,
    [answers],
  );

  function start(selectedMode: Mode) {
    setMode(selectedMode);
    setQuestions(buildRound(POOLS[selectedMode], ROUND_SIZE));
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setPhase("jugando");
  }

  function pick(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    setAnswers((current) => [
      ...current,
      { question: questions[index], picked: optionIndex },
    ]);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setPhase("final");
    } else {
      setIndex((current) => current + 1);
      setSelected(null);
    }
  }

  /* ── Pantalla de inicio ─────────────────────────────────────────── */
  if (phase === "inicio") {
    return (
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(
          [
            {
              id: "habituales" as Mode,
              title: "Elementos habituales",
              detail: "Los ~45 elementos que de verdad caen en clase: periodos 1–4 más los metales clásicos (Ag, Au, Pb, Hg…).",
              icon: Brain,
            },
            {
              id: "completa" as Mode,
              title: "Los 118 elementos",
              detail: "La tabla entera, incluidos lantánidos, actínidos y los sintéticos. Solo para valientes.",
              icon: Trophy,
            },
          ] satisfies Array<{
            id: Mode;
            title: string;
            detail: string;
            icon: typeof Brain;
          }>
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => start(option.id)}
            className="group rounded-2xl border border-ink/10 bg-white/50 p-6 text-left transition hover:-translate-y-0.5 hover:border-(--brand) hover:shadow-[0_18px_40px_-24px_rgba(27,23,16,0.5)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--brand) text-paper transition group-hover:scale-105">
              <option.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="mt-4 block font-display text-xl font-semibold">
              {option.title}
            </span>
            <span className="mt-1.5 block text-sm leading-relaxed text-ink-soft">
              {option.detail}
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-(--brand)">
              {ROUND_SIZE} preguntas · empezar
              <span aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  /* ── Resultados ─────────────────────────────────────────────────── */
  if (phase === "final") {
    const summary = tier(score);
    const wrong = answers.filter((a) => a.picked !== a.question.correctIndex);
    return (
      <div className="animate-rise mt-10 mx-auto max-w-2xl">
        <div className="rounded-2xl bg-ink p-8 text-center text-paper sm:p-10">
          <Trophy className="mx-auto h-8 w-8 text-(--brand-2)" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 font-display text-6xl font-black leading-none">
            {score}
            <span className="text-2xl font-semibold text-paper/50">/{ROUND_SIZE}</span>
          </p>
          <p className="mt-3 font-display text-2xl font-semibold">
            {summary.title}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-paper/70">
            {summary.detail}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => start(mode)}
              className="touch-target inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-(--brand-2)"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Repetir ronda
            </button>
            <button
              type="button"
              onClick={() => setPhase("inicio")}
              className="touch-target inline-flex items-center gap-2 rounded-full border border-paper/25 px-5 py-2.5 text-sm font-medium text-paper/85 transition hover:border-paper/60 hover:text-paper"
            >
              Cambiar modo
            </button>
          </div>
        </div>

        {wrong.length > 0 ? (
          <div className="mt-8">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              Repasa estos {wrong.length} fallos
            </h2>
            <ul className="mt-3 space-y-2.5">
              {wrong.map(({ question, picked }) => (
                <li
                  key={`${question.concept}-${question.correctIndex}-${
                    question.options[0]
                  }`}
                  className="rounded-xl border border-ink/10 bg-white/50 p-4"
                >
                  <p className="text-sm font-medium">{question.prompt}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-clay">
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Tu respuesta: {question.options[picked]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sage">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Correcta: {question.options[question.correctIndex]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-center text-sm text-ink-soft">
              Refuerza con la{" "}
              <Link href="/estudio/tabla-periodica" className="font-semibold text-(--brand) underline decoration-dotted underline-offset-4 hover:text-(--brand-2)">
                tabla periódica interactiva
              </Link>{" "}
              y vuelve a intentarlo.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-ink-soft">
            Ronda perfecta. Prueba{" "}
            <button
              type="button"
              onClick={() => start("completa")}
              className="font-semibold text-(--brand) underline decoration-dotted underline-offset-4 hover:text-(--brand-2)"
            >
              los 118 elementos
            </button>
            .
          </p>
        )}
      </div>
    );
  }

  /* ── Jugando ────────────────────────────────────────────────────── */
  const question = questions[index];
  const progress = ((index + (selected !== null ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="mt-10 mx-auto max-w-2xl">
      {/* Marcador */}
      <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
        <p aria-live="polite">
          Pregunta {index + 1} de {questions.length}
        </p>
        <p>
          Aciertos:{" "}
          <strong className="text-ink">{score}</strong>
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de la ronda">
        <div
          className="h-full rounded-full bg-(--brand) transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pregunta */}
      <div key={index} className="animate-rise mt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-(--brand-2)">
          {question.concept}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-snug sm:text-3xl">
          {question.prompt}
        </h2>

        <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => {
            const isCorrect = optionIndex === question.correctIndex;
            const isPicked = optionIndex === selected;
            const revealed = selected !== null;
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => pick(optionIndex)}
                  disabled={revealed}
                  className={`touch-target group flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition ${
                    revealed
                      ? isCorrect
                        ? "border-sage bg-sage/15 text-ink"
                        : isPicked
                          ? "border-clay bg-clay/15 text-ink"
                          : "border-ink/10 text-ink-soft opacity-55"
                      : "border-ink/15 bg-white/50 hover:-translate-y-0.5 hover:border-(--brand) hover:shadow-[0_12px_28px_-18px_rgba(27,23,16,0.5)]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                      revealed && isCorrect
                        ? "bg-sage text-ink"
                        : revealed && isPicked
                          ? "bg-clay text-ink"
                          : "bg-ink/[0.07] text-ink-soft transition group-hover:bg-(--brand) group-hover:text-paper"
                    }`}
                    aria-hidden="true"
                  >
                    {LETTERS[optionIndex]}
                  </span>
                  {option}
                </button>
              </li>
            );
          })}
        </ul>

        <div aria-live="polite" className="min-h-0">
          {selected !== null ? (
            <div className="animate-rise mt-5 rounded-xl border border-ink/10 bg-paper-deep/40 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {selected === question.correctIndex ? (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5 text-sage" aria-hidden="true" />
                    ¡Correcto!
                  </>
                ) : (
                  <>
                    <XCircle className="h-4.5 w-4.5 text-clay" aria-hidden="true" />
                    Casi…
                  </>
                )}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {question.explanation}
              </p>
              <button
                type="button"
                onClick={next}
                className="touch-target mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-(--brand)"
              >
                {index + 1 >= questions.length ? "Ver resultados" : "Siguiente"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
