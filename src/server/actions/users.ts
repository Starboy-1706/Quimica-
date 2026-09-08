"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  academicRoleEnum,
  userStatusEnum,
  users,
  type AcademicRole,
  type UserStatus,
} from "@/db/schema";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/action-state";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/passwords";
import { requireActionUser } from "@/lib/auth/session";

function revalidateUsers(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

/**
 * Gestión de cuentas individuales — solo Administrador.
 * Reemplaza por completo el modelo de "contraseña compartida".
 */
export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser(["administrador"]);

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const role = String(formData.get("role") ?? "editor") as AcademicRole;
    const password = String(formData.get("password") ?? "");

    if (!fullName) return actionError("El nombre completo es obligatorio.");
    if (!email || !email.includes("@")) {
      return actionError("Ingresa un correo válido.");
    }
    if (!academicRoleEnum.enumValues.includes(role)) {
      return actionError("Rol académico no válido.");
    }
    if (password.length < 8) {
      return actionError("La contraseña debe tener al menos 8 caracteres.");
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return actionError(`Ya existe una cuenta registrada con ${email}.`);
    }

    const passwordHash = await hashPassword(password);
    const [created] = await db
      .insert(users)
      .values({ fullName, email, role, passwordHash })
      .returning();

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.USER_CREATED,
      entity: "user",
      entityId: created.id,
      summary: `${actor.fullName} creó la cuenta de ${fullName} (${email}) con rol «${role}»`,
      metadata: { email, role },
    });

    revalidateUsers();
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo crear la cuenta.",
    );
  }
}

export async function setUserStatusAction(
  userId: string,
  status: UserStatus,
): Promise<void> {
  if (!userStatusEnum.enumValues.includes(status)) return;
  const actor = await requireActionUser(["administrador"]);

  if (userId === actor.id) return; // nadie puede suspender su propia cuenta

  const [target] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!target || target.status === status) return;

  await db
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await recordAuditLog({
    actor,
    action: AUDIT_ACTIONS.USER_STATUS,
    entity: "user",
    entityId: userId,
    summary: `${actor.fullName} cambió la cuenta de ${target.fullName} a «${status}»`,
    metadata: { from: target.status, to: status, email: target.email },
  });

  revalidateUsers();
}
