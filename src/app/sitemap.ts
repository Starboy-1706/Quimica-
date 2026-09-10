import type { MetadataRoute } from "next";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/asignaturas`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/agenda`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/estudio`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/estudio/tabla-periodica`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/estudio/calculadora`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/estudio/quiz`, changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    const publicCourses = await db.query.courses.findMany({
      where: and(eq(courses.status, "publicado"), isNull(courses.deletedAt)),
      columns: { slug: true, updatedAt: true },
    });

    const courseRoutes: MetadataRoute.Sitemap = publicCourses.map((course) => ({
      url: `${baseUrl}/cursos/${course.slug}`,
      lastModified: course.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    return [...staticRoutes, ...courseRoutes];
  } catch {
    // Si la base de datos no está disponible en tiempo de compilación,
    // devolvemos las rutas estáticas base de forma segura.
    return staticRoutes;
  }
}
