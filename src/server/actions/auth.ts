"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  actionError,
  type ActionState,
} from "@/lib/action-state";
import {
  AUDIT_ACTIONS,
  getRequestMeta,
  recordAuditLog,
} from "@/lib/audit";
import { verifyPassword } from "@/lib/auth/passwords";
import {
  createSession,
  destroySession,
  getSessionUser,
} from "@/lib/auth/session";

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "").trim();
  const emailInput = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = String(formData.get("next") ?? "");

  if (!password) {
    return actionError("Por favor, ingresa la contraseña de acceso.");
  }

  // Si se envió un correo específico, buscamos ese usuario.
  // Si no (modo contraseña única), buscamos entre los administradores y usuarios activos.
  let matchedUser = null;

  if (emailInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailInput))
      .limit(1);

    if (user && (await verifyPassword(password, user.passwordHash))) {
      matchedUser = user;
    }
  } else {
    // Buscar en todas las cuentas activas (priorizando administradores)
    const activeUsers = await db
      .select()
      .from(users)
      .where(eq(users.status, "activo"));

    activeUsers.sort((a, b) => (a.role === "administrador" ? -1 : 1));

    for (const candidate of activeUsers) {
      if (await verifyPassword(password, candidate.passwordHash)) {
        matchedUser = candidate;
        break;
      }
    }
  }

  if (!matchedUser) {
    await recordAuditLog({
      actor: null,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entity: "session",
      summary: "Intento de acceso fallido (contraseña incorrecta)",
      metadata: { metodo: emailInput ? "correo_y_clave" : "clave_directa" },
    });
    return actionError("Contraseña incorrecta. Verifica e inténtalo de nuevo.");
  }

  if (matchedUser.status !== "activo") {
    await recordAuditLog({
      actor: matchedUser,
      action: AUDIT_ACTIONS.LOGIN_BLOCKED,
      entity: "session",
      entityId: matchedUser.id,
      summary: `Acceso bloqueado: cuenta suspendida (${matchedUser.email})`,
    });
    return actionError("La cuenta asociada está suspendida. Contacta al soporte.");
  }

  const meta = await getRequestMeta();
  await createSession(matchedUser.id, meta);
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, matchedUser.id));

  await recordAuditLog({
    actor: matchedUser,
    action: AUDIT_ACTIONS.LOGIN,
    entity: "session",
    entityId: matchedUser.id,
    summary: `${matchedUser.fullName} inició sesión`,
    metadata: { metodo: "clave_directa" },
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await recordAuditLog({
      actor: user,
      action: AUDIT_ACTIONS.LOGOUT,
      entity: "session",
      entityId: user.id,
      summary: `${user.fullName} cerró sesión`,
    });
  }
  redirect("/admin/login");
}
