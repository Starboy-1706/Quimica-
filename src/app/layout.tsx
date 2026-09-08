import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f5e5b",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  appleWebApp: {
    capable: true,
    title: "Aula Docente",
    statusBarStyle: "default",
  },
  title: {
    default: "Aula Docente — Prof. Wilmer Molina · Departamento de Química",
    template: "%s · Aula Docente — Prof. Wilmer Molina",
  },
  description:
    "Portal académico del Prof. Wilmer Molina (Departamento de Química): asignaturas de química, avisos, agenda de evaluaciones y repositorio descargable de materiales.",
  keywords: [
    "química",
    "asignaturas",
    "laboratorio",
    "universidad",
    "docencia",
    "materiales de estudio",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Aula Docente — Prof. Wilmer Molina",
    title: "Aula Docente — Prof. Wilmer Molina · Departamento de Química",
    description:
      "Asignaturas de química, avisos, agenda de evaluaciones y repositorio descargable de materiales de estudio.",
    url: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
