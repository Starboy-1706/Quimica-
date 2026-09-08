/** Claves de configuración del sitio — módulo PURO (cliente y servidor). */

export const SITE_SETTING_KEYS = [
  // Identidad general
  "site_title",
  "site_tagline",
  "site_description",
  "academic_term",
  "institution_name",
  "footer_text",
  // Colores institucionales
  "brand_primary",
  "brand_accent",
  // Portada / Hero
  "hero_bg_word",
  "hero_badge",
  "hero_image_url",
  "about_image_url",
  // Títulos y subtítulos de secciones públicas
  "section_courses_title",
  "section_courses_subtitle",
  "section_agenda_title",
  "section_agenda_subtitle",
  "section_announcements_title",
  "section_about_title",
  "section_contact_title",
  "section_contact_subtitle",
  // Configuración de Notificaciones / Resend
  "resend_api_key",
  "resend_from",
  "notify_email",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export const SITE_SETTING_DESCRIPTIONS: Record<SiteSettingKey, string> = {
  // Identidad general
  site_title: "Título principal de la portada",
  site_tagline: "Frase o lema bajo el título principal",
  site_description: "Descripción general del portal / bienvenida",
  academic_term: "Período académico en curso (ej. 2026-I)",
  institution_name: "Nombre de la facultad o universidad",
  footer_text: "Texto personalizado del pie de página",
  // Colores institucionales
  brand_primary: "Color primario institucional (hex)",
  brand_accent: "Color de acento institucional (hex)",
  // Portada / Hero
  hero_bg_word: "Palabra de fondo en la portada (marca de agua)",
  hero_badge: "Etiqueta superior en la portada",
  hero_image_url: "Imagen de portada importada desde el dispositivo",
  about_image_url: "Imagen de la sección docente importada desde el dispositivo",
  // Títulos y subtítulos de secciones públicas
  section_courses_title: "Título de la sección de asignaturas",
  section_courses_subtitle: "Descripción de la sección de asignaturas",
  section_agenda_title: "Título de la sección de agenda / evaluaciones",
  section_agenda_subtitle: "Descripción de la sección de agenda",
  section_announcements_title: "Título de la sección de avisos",
  section_about_title: "Título de la sección sobre el docente",
  section_contact_title: "Título de la sección de contacto",
  section_contact_subtitle: "Descripción de la sección de contacto",
  // Configuración de Notificaciones / Resend
  resend_api_key: "Clave de API de Resend (re_...)",
  resend_from: "Remitente de correos (ej. Aula Docente <onboarding@resend.dev>)",
  notify_email: "Correo del profesor para recibir las alertas de consultas",
};
