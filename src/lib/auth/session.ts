import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  userSessions,
  users,
  type AcademicRole,
  type User,
} from "@/db/schema";

/**
 * Sesiones persistidas en `user_sessions`.
 * - El navegador recibe un token opaco en una cookie httpOnly.
 * - En base de datos solo se guarda el hash SHA-256 del token.
 * - La verificación definitiva ocurre en el servidor (el middleware de
 *   Next.js actúa como primera barrera, sin tocar la base de datos).
 */
export const SESSION_COOKIE = "docencia_session";
export const SESSION_TTL_DAYS = 30;

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta: { ipAddress?: string | null; userAgent?: string | null },
): Promise<void> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);

  await db.insert(userSessions).values({
    userId,
    tokenHash: hashSessionToken(token),
    ipAddress: meta.ipAddress ?? null,
    userAgent: meta.userAgent ?? null,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(eq(userSessions.tokenHash, hashSessionToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<
  User,
  "id" | "email" | "fullName" | "role" | "status"
>;

/**
 * Usuario autenticado de la petición actual (memoizado por request).
 * Devuelve `null` si no hay sesión, expiró, fue revocada o la cuenta
 * está suspendida.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      user: {
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        status: users.status,
      },
      sessionId: userSessions.id,
      expiresAt: userSessions.expiresAt,
      revokedAt: userSessions.revokedAt,
    })
    .from(userSessions)
    .innerJoin(users, eq(users.id, userSessions.userId))
    .where(eq(userSessions.tokenHash, hashSessionToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  if (row.user.status !== "activo") return null;

  // Trazabilidad de actividad reciente (sin bloquear la respuesta).
  void (async () => {
    try {
      await db
        .update(userSessions)
        .set({ lastSeenAt: new Date() })
        .where(eq(userSessions.id, row.sessionId));
    } catch {
      /* no-op */
    }
  })();

  return row.user;
});

/**
 * Guardas de rol — la autorización siempre se evalúa en el servidor.
 */

/** Para páginas/layouts: redirige al login o al panel si el rol no basta. */
export async function requirePageUser(
  roles?: AcademicRole[],
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (roles && !roles.includes(user.role)) redirect("/admin");
  return user;
}

/** Para Server Actions: lanza un error controlado y legible. */
export async function requireActionUser(
  roles?: AcademicRole[],
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  if (roles && !roles.includes(user.role)) {
    throw new Error("No tienes permisos para realizar esta acción.");
  }
  return user;
}
