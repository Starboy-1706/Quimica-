/**
 * Editor visual sanitizado — módulo PURO (servidor y navegador).
 * ------------------------------------------------------------------
 * Mini-lenguaje seguro para descripciones de cursos y avisos:
 *
 *   **negrita**            *cursiva*           __subrayado__
 *   H~2~O        → H<sub>2</sub>O              (subíndice: ~…~)
 *   E = mc^2^    → E = mc<sup>2</sup>          (superíndice: ^…^)
 *   Ca^2+^, SO~4~^2-^      notación química básica
 *   [texto](https://url)   enlace seguro
 *   - ítem                 lista con viñetas
 *   `expr`                 fragmento de fórmula/código en línea
 *
 * Garantía de sanitización: el texto se escapa por completo ANTES de
 * aplicar los patrones permitidos, por lo que HTML/JS inyectado nunca
 * alcanza la salida. Solo se generan etiquetas allowlist.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(escaped: string): string {
  let out = escaped;

  // Fórmula/código en línea primero (su contenido queda literal).
  out = out.replace(
    /`([^`\n]+)`/g,
    '<code class="formula">$1</code>',
  );

  // Enlaces [texto](https://…|http://…) — solo protocolos seguros.
  out = out.replace(
    /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Negrita, subrayado y cursiva.
  out = out.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_\n]+)__/g, "<u>$1</u>");
  out = out.replace(/(^|[^*\w])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  // Subíndice ~…~ y superíndice ^…^ (notación química/matemática).
  out = out.replace(/~([^~\s][^~\n]*)~/g, "<sub>$1</sub>");
  out = out.replace(/\^([^^\s][^^\n]*)\^/g, "<sup>$1</sup>");

  return out;
}

/** Convierte el mini-lenguaje a HTML sanitizado (string seguro). */
export function renderRichText(raw: string): string {
  if (!raw.trim()) return "";

  const escaped = escapeHtml(raw);
  const blocks = escaped.split(/\n{2,}/);

  const html = blocks
    .map((block) => {
      const lines = block.split("\n");
      const isList = lines.every((line) => line.trim().startsWith("- "));
      if (isList && lines.length > 0) {
        const items = lines
          .map((line) => `<li>${renderInline(line.trim().slice(2))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      const withBreaks = lines
        .map((line) => renderInline(line))
        .join("<br />");
      return `<p>${withBreaks}</p>`;
    })
    .join("");

  return html;
}

/** Versión en texto plano (para meta descripciones y Schema.org). */
export function richTextToPlain(raw: string): string {
  return raw
    .replace(/\[([^\]\n]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~^`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fragmentos de ayuda mostrados en la barra del editor. */
export const RICH_TEXT_SNIPPETS = [
  { label: "B", title: "Negrita", before: "**", after: "**", sample: "texto" },
  { label: "I", title: "Cursiva", before: "*", after: "*", sample: "texto" },
  { label: "U", title: "Subrayado", before: "__", after: "__", sample: "texto" },
  { label: "x₂", title: "Subíndice (H₂O)", before: "~", after: "~", sample: "2" },
  { label: "x²", title: "Superíndice (Ca²⁺)", before: "^", after: "^", sample: "2+" },
] as const;
