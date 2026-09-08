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
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return actionError("Ingresa tu correo institucional y tu contraseña.");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    await recordAuditLog({
      actor: null,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entity: "session",
      summary: `Intento de acceso fallido para ${email}`,
      metadata: { email },
    });
    return actionError("Credenciales inválidas. Verifica tus datos.");
  }

  if (user.status !== "activo") {
    await recordAuditLog({
      actor: user,
      action: AUDIT_ACTIONS.LOGIN_BLOCKED,
      entity: "session",
      entityId: user.id,
      summary: `Acceso bloqueado: cuenta suspendida (${email})`,
    });
    return actionError("Tu cuenta está suspendida. Contacta al administrador.");
  }

  const meta = await getRequestMeta();
  await createSession(user.id, meta);
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await recordAuditLog({
    actor: user,
    action: AUDIT_ACTIONS.LOGIN,
    entity: "session",
    entityId: user.id,
    summary: `${user.fullName} inició sesión`,
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
