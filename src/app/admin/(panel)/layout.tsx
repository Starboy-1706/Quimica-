import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { PanelSidebar } from "@/components/admin/chrome";
import { requirePageUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Guarda de servidor para TODO el panel /admin.
 * Aunque el proxy ya exige la cookie de sesión, aquí se valida contra
 * la base de datos que la sesión siga vigente, no esté revocada y la
 * cuenta permanezca activa. También se calcula el contador de
 * consultas nuevas para la insignia de navegación.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePageUser();
  const [newMessages] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "nuevo"));

  return (
    <div className="min-h-screen bg-night text-cream">
      <PanelSidebar user={user} newMessages={newMessages.value} />
      <main className="min-h-screen lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
