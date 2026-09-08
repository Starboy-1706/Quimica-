/** Claves de configuración del sitio — módulo PURO (cliente y servidor). */

export const SITE_SETTING_KEYS = [
  "site_title",
  "site_tagline",
  "site_description",
  "academic_term",
  "brand_primary",
  "brand_accent",
  "notify_email",
] as const;

export const SITE_SETTING_DESCRIPTIONS: Record<string, string> = {
  site_title: "Título principal del sitio público",
  site_tagline: "Frase de presentación bajo el título",
  site_description: "Descripción larga para la sección de bienvenida",
  academic_term: "Período académico en curso",
  brand_primary: "Color primario institucional (hex)",
  brand_accent: "Color de acento institucional (hex)",
  notify_email: "Correo del profesor para alertas de nuevas consultas",
};
