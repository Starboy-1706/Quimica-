import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setUserStatusAction } from "@/server/actions/users";
import { requirePageUser } from "@/lib/auth/session";
import { formatDate, formatDateTime, initials } from "@/lib/format";
import { CreateUserForm } from "@/components/admin/forms";
import {
  ActionFormButton,
  Badge,
  EmptyState,
  PageHeader,
  RoleBadge,
  TableShell,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Cuentas" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Solo el Administrador gestiona cuentas individuales.
  const currentUser = await requirePageUser(["administrador"]);

  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <PageHeader
        eyebrow="Acceso · Cuentas individuales"
        title="Cuentas del aula"
        description="Gestión de cuentas individuales con roles académicos. Queda descartado cualquier modelo de contraseña compartida."
      />

      <div className="mb-8 flex items-start gap-4 rounded-2xl border border-brass/25 bg-brass/[0.06] p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
        <div className="text-sm leading-relaxed text-sand">
          <p className="font-medium text-cream">
            Principio de identidad individual
          </p>
          <p className="mt-1 text-xs text-muted">
            Cada persona que administra contenido ingresa con su propio correo
            y contraseña (hash scrypt). Las sesiones viven en{" "}
            <code className="rounded bg-lift px-1.5 py-0.5 font-mono text-[10px]">
              user_sessions
            </code>{" "}
            y toda acción queda firmada en la bitácora con autor, rol e IP.
          </p>
        </div>
      </div>

      <CreateUserForm />

      {allUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin cuentas registradas"
          description="Ejecuta el script de semilla o crea la primera cuenta aquí."
        />
      ) : (
        <TableShell>
          <THead>
            <Th>Persona</Th>
            <Th>Rol</Th>
            <Th>Estado</Th>
            <Th>Último acceso</Th>
            <Th>Creada</Th>
            <Th>Acciones</Th>
          </THead>
          <tbody>
            {allUsers.map((account) => {
              const isSelf = account.id === currentUser.id;
              return (
                <Tr key={account.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lift font-display text-sm font-semibold text-brass">
                        {initials(account.fullName)}
                      </span>
                      <div className="leading-tight">
                        <p className="font-medium text-cream">
                          {account.fullName}
                          {isSelf ? (
                            <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-muted">
                              tú
                            </span>
                          ) : null}
                        </p>
                        <p className="text-[11px] text-muted">
                          {account.email}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <RoleBadge role={account.role} />
                  </Td>
                  <Td>
                    <Badge tone={account.status === "activo" ? "green" : "red"}>
                      {account.status === "activo" ? "Activo" : "Suspendido"}
                    </Badge>
                  </Td>
                  <Td className="text-muted">
                    {formatDateTime(account.lastLoginAt)}
                  </Td>
                  <Td className="text-muted">
                    {formatDate(account.createdAt)}
                  </Td>
                  <Td>
                    {isSelf ? (
                      <span className="text-[11px] text-muted">
                        No puedes suspender tu propia cuenta
                      </span>
                    ) : account.status === "activo" ? (
                      <form
                        action={setUserStatusAction.bind(
                          null,
                          account.id,
                          "suspendido",
                        )}
                      >
                        <ActionFormButton title="Suspender cuenta" danger>
                          <UserX className="h-3.5 w-3.5" /> Suspender
                        </ActionFormButton>
                      </form>
                    ) : (
                      <form
                        action={setUserStatusAction.bind(
                          null,
                          account.id,
                          "activo",
                        )}
                      >
                        <ActionFormButton title="Reactivar cuenta">
                          <UserCheck className="h-3.5 w-3.5" /> Reactivar
                        </ActionFormButton>
                      </form>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
