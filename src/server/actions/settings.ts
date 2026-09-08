"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { professorProfile, siteSettings, users } from "@/db/schema";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/action-state";
import { AUDIT_ACTIONS, recordAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/passwords";
import { requireActionUser } from "@/lib/auth/session";
import {
  SITE_SETTING_DESCRIPTIONS,
  SITE_SETTING_KEYS,
} from "@/lib/settings-keys";
import {
  buildTestEmail,
  getNotifyEmail,
  resendConfigured,
  sendEmail,
} from "@/lib/email/resend";

function revalidateSettings(): void {
  revalidatePath("/");
  revalidatePath("/asignaturas");
  revalidatePath("/agenda");
  revalidatePath("/admin");
  revalidatePath("/admin/ajustes");
}

export async function updateSiteSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser(["administrador"]);

    const changed: Record<string, string> = {};
    for (const key of SITE_SETTING_KEYS) {
      changed[key] = String(formData.get(key) ?? "").trim();
    }

    if (!changed.site_title) {
      return actionError("El título principal de la portada no puede quedar vacío.");
    }

    for (const colorKey of ["brand_primary", "brand_accent"] as const) {
      const value = changed[colorKey];
      if (value && !/^#[0-9a-fA-F]{6}$/.test(value)) {
        return actionError(
          `El color «${colorKey}» debe ser hexadecimal válido (ej. #0f5e5b).`,
        );
      }
    }

    if (
      changed.notify_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changed.notify_email)
    ) {
      return actionError("El correo para alertas no tiene un formato válido.");
    }

    for (const key of SITE_SETTING_KEYS) {
      await db
        .insert(siteSettings)
        .values({
          key,
          value: changed[key],
          description: SITE_SETTING_DESCRIPTIONS[key] ?? null,
          updatedAt: new Date(),
          updatedBy: actor.id,
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value: changed[key],
            updatedAt: new Date(),
            updatedBy: actor.id,
          },
        });
    }

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      entity: "site_setting",
      entityId: null,
      summary: `${actor.fullName} actualizó la configuración y personalización del portal`,
      metadata: { keys: [...SITE_SETTING_KEYS] },
    });

    revalidateSettings();
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error
        ? error.message
        : "No se pudieron guardar los ajustes.",
    );
  }
}

export async function updateProfessorProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser(["administrador"]);

    const fullName = String(formData.get("fullName") ?? "").trim();
    const headline = String(formData.get("headline") ?? "").trim();
    const department = String(formData.get("department") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const office = String(formData.get("office") ?? "").trim();
    const officeHours = String(formData.get("officeHours") ?? "").trim();
    const contactEmail = String(formData.get("contactEmail") ?? "").trim();
    const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

    if (!headline) {
      return actionError("El encabezado profesional es obligatorio.");
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return actionError("El correo institucional no tiene un formato válido.");
    }

    // El perfil público pertenece a la cuenta del administrador titular
    const [admin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "administrador"))
      .limit(1);
    if (!admin) return actionError("No existe una cuenta administradora.");

    // Actualizar nombre completo del usuario si fue modificado
    if (fullName) {
      await db
        .update(users)
        .set({ fullName, updatedAt: new Date() })
        .where(eq(users.id, admin.id));
    }

    const payload = {
      headline,
      department: department || null,
      bio: bio || null,
      office: office || null,
      officeHours: officeHours || null,
      contactEmail: contactEmail || null,
      avatarUrl: avatarUrl || null,
    };

    const [existing] = await db
      .select()
      .from(professorProfile)
      .where(eq(professorProfile.userId, admin.id))
      .limit(1);

    if (existing) {
      await db
        .update(professorProfile)
        .set({ ...payload, updatedAt: new Date() })
        .where(eq(professorProfile.id, existing.id));
    } else {
      await db.insert(professorProfile).values({
        userId: admin.id,
        ...payload,
      });
    }

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.PROFILE_UPDATED,
      entity: "professor_profile",
      entityId: admin.id,
      summary: `${actor.fullName} actualizó el perfil docente público`,
    });

    revalidateSettings();
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error
        ? error.message
        : "No se pudo guardar el perfil docente.",
    );
  }
}

/** Cambio directo de la contraseña de acceso al panel. */
export async function updateAdminPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser(["administrador"]);
    const newPassword = String(formData.get("newPassword") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

    if (!newPassword || newPassword.length < 6) {
      return actionError("La nueva contraseña debe tener al menos 6 caracteres.");
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return actionError("Las contraseñas no coinciden. Verifícalas.");
    }

    const passwordHash = await hashPassword(newPassword);

    // Actualizar la contraseña del usuario administrador actual
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, actor.id));

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.USER_STATUS,
      entity: "user",
      entityId: actor.id,
      summary: `${actor.fullName} actualizó la contraseña de acceso al panel`,
    });

    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo cambiar la contraseña.",
    );
  }
}

/** Envía un correo de prueba al destinatario de alertas configurado. */
export async function sendTestEmailAction(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await requireActionUser(["administrador"]);

    const notifyTo = await getNotifyEmail();
    if (!notifyTo) {
      return actionError(
        "Configura primero el «Correo para alertas» en los ajustes.",
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const template = buildTestEmail({ panelUrl: `${siteUrl}/admin` });
    const result = await sendEmail({
      to: notifyTo,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    if (!result.ok) {
      return actionError(`El envío falló: ${result.error}`);
    }

    const isConfigured = await resendConfigured();

    await recordAuditLog({
      actor,
      action: AUDIT_ACTIONS.NOTIFICATION_TEST,
      entity: "site_setting",
      summary: `${actor.fullName} envió un correo de prueba a ${notifyTo} (${result.simulated ? "modo simulado" : "Resend"})`,
      metadata: {
        destino: notifyTo,
        modo: result.simulated ? "simulado" : "resend",
        configurado: isConfigured,
      },
    });

    revalidatePath("/admin/auditoria");
    return actionSuccess();
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "No se pudo enviar la prueba.",
    );
  }
}
