"use client";

import { useRef, useState } from "react";
import { Eye, Link2, List, PencilLine } from "lucide-react";
import { renderRichText, RICH_TEXT_SNIPPETS } from "@/lib/rich-text";

/**
 * Editor visual sanitizado (textarea mejorada con barra y vista previa).
 * Inserta marcadores del mini-lenguaje seguro de src/lib/rich-text.ts:
 * negrita, cursiva, subíndices/superíndices (notación química), enlaces,
 * listas y fragmentos de fórmula. La vista previa usa exactamente el
 * mismo renderizador que el sitio público.
 */
export function RichTextEditor({
  name,
  label,
  hint,
  defaultValue = "",
  placeholder,
  rows = 7,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  function applySnippet(before: string, after: string, sample: string) {
    const area = areaRef.current;
    if (!area) return;
    const start = area.selectionStart ?? value.length;
    const end = area.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || sample;
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      area.focus();
      const cursor = start + before.length + selected.length + after.length;
      area.setSelectionRange(cursor, cursor);
    });
  }

  function insertLink() {
    applySnippet("[", "](https://)", "texto del enlace");
  }

  function insertListItem() {
    applySnippet("\n- ", "", "ítem de la lista");
  }

  return (
    <div>
      <span className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-sand">{label}</span>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-[11px] text-sand transition hover:border-brass/50 hover:text-brass"
        >
          {preview ? (
            <>
              <PencilLine className="h-3 w-3" /> Editar
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" /> Vista previa
            </>
          )}
        </button>
      </span>

      {!preview ? (
        <div className="overflow-hidden rounded-xl border border-line bg-lift focus-within:border-brass/60 focus-within:ring-2 focus-within:ring-brass/20">
          <div className="flex flex-wrap items-center gap-1 border-b border-line bg-panel px-2 py-1.5">
            {RICH_TEXT_SNIPPETS.map((snippet) => (
              <button
                key={snippet.title}
                type="button"
                title={snippet.title}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() =>
                  applySnippet(snippet.before, snippet.after, snippet.sample)
                }
                className="min-w-8 rounded-md px-2 py-1 font-mono text-[11px] font-medium text-sand transition hover:bg-lift hover:text-brass"
              >
                {snippet.label}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-line" />
            <button
              type="button"
              title="Enlace"
              onClick={insertLink}
              className="rounded-md px-2 py-1 text-sand transition hover:bg-lift hover:text-brass"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Lista con viñetas"
              onClick={insertListItem}
              className="rounded-md px-2 py-1 text-sand transition hover:bg-lift hover:text-brass"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <span className="ml-auto hidden font-mono text-[10px] text-muted sm:block">
              H~2~O · Ca^2+^ sanitizado
            </span>
          </div>
          <textarea
            ref={areaRef}
            name={name}
            rows={rows}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="w-full resize-y bg-transparent px-3.5 py-2.5 text-sm leading-relaxed text-cream placeholder:text-muted/70 focus:outline-none"
          />
        </div>
      ) : (
        <>
          {/* El textarea oculto conserva el valor para el envío del formulario */}
          <input type="hidden" name={name} value={value} />
          <div
            className="rich min-h-24 w-full rounded-xl border border-line bg-lift/60 px-4 py-3 text-sm leading-relaxed text-cream"
            dangerouslySetInnerHTML={{
              __html:
                renderRichText(value) ||
                '<span class="italic text-muted">Nada que previsualizar todavía…</span>',
            }}
          />
        </>
      )}
      {hint ? (
        <span className="mt-1 block text-[11px] text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
