import type { Metadata } from "next";
import { desc, isNull } from "drizzle-orm";
import {
  Archive,
  BookMarked,
  ExternalLink,
  FileStack,
  FileText,
  FlaskConical,
  GraduationCap,
  Globe,
  Link2,
  Lock,
  PackageOpen,
  PencilRuler,
  Presentation,
  Trash2,
} from "lucide-react";
import { db } from "@/db";
import { courseMaterials, courses } from "@/db/schema";
import {
  setMaterialStatusAction,
  softDeleteMaterialAction,
} from "@/server/actions/materials";
import { requirePageUser } from "@/lib/auth/session";
import { formatDate, MATERIAL_TYPE_LABELS } from "@/lib/format";
import { formatBytes } from "@/lib/upload-rules";
import { CreateMaterialForm } from "@/components/admin/forms";
import { BulkUploadPanel } from "@/components/admin/upload";
import {
  ActionFormButton,
  Badge,
  EmptyState,
  PageHeader,
  StatusBadge,
  TableShell,
  Td,
  Th,
  THead,
  Tr,
  VersionBadge,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Materiales" };
export const dynamic = "force-dynamic";

const TYPE_ICONS = {
  apunte: FileText,
  guia: BookMarked,
  laboratorio: FlaskConical,
  presentacion: Presentation,
  ejercicios: PencilRuler,
  syllabus: GraduationCap,
  enlace: Link2,
} as const;

export default async function AdminMaterialsPage() {
  await requirePageUser();

  const [allMaterials, courseOptions] = await Promise.all([
    db.query.courseMaterials.findMany({
      where: isNull(courseMaterials.deletedAt),
      orderBy: [desc(courseMaterials.createdAt)],
      with: { course: { columns: { code: true, title: true } } },
    }),
    db.query.courses.findMany({
      where: isNull(courses.deletedAt),
      columns: { id: true, code: true, title: true },
      orderBy: (fields, { asc }) => [asc(fields.code)],
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Contenido · Repositorio"
        title="Repositorio de materiales"
        description="Documentos organizados por categoría: guías de prácticas de laboratorio, ejercicios resueltos, presentaciones, programas… con subida validada y acceso restringido."
      />

      <BulkUploadPanel courses={courseOptions} />
      <CreateMaterialForm courses={courseOptions} />

      {allMaterials.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="Sin materiales todavía"
          description="Sube el primer documento con «Nuevo material» o usa la carga masiva para un lote completo."
        />
      ) : (
        <TableShell>
          <THead>
            <Th>Material</Th>
            <Th>Asignatura</Th>
            <Th>Categoría</Th>
            <Th>Estado</Th>
            <Th>Versión</Th>
            <Th>Creado</Th>
            <Th>Acciones</Th>
          </THead>
          <tbody>
            {allMaterials.map((material) => {
              const Icon = TYPE_ICONS[material.type] ?? FileText;
              return (
                <Tr key={material.id}>
                  <Td>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 font-medium text-cream transition hover:text-brass"
                    >
                      <span className="line-clamp-1 max-w-56">
                        {material.title}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted group-hover:text-brass" />
                    </a>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                      {material.unit ? <span>{material.unit}</span> : null}
                      {material.fileKey ? (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Lock className="h-2.5 w-2.5 text-sage" />
                          {material.fileName ?? "archivo"}
                          {material.fileSize
                            ? ` · ${formatBytes(material.fileSize)}`
                            : ""}
                        </span>
                      ) : null}
                    </p>
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px] text-sand">
                      {material.course.code}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone="blue">
                      <Icon className="h-3 w-3" />
                      {MATERIAL_TYPE_LABELS[material.type]}
                    </Badge>
                  </Td>
                  <Td>
                    <StatusBadge status={material.status} />
                  </Td>
                  <Td>
                    <VersionBadge version={material.version} />
                  </Td>
                  <Td className="text-muted">
                    {formatDate(material.createdAt)}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {material.status !== "publicado" ? (
                        <form
                          action={setMaterialStatusAction.bind(null, material.id, "publicado")}
                        >
                          <ActionFormButton title="Publicar">
                            <Globe className="h-3.5 w-3.5" />
                          </ActionFormButton>
                        </form>
                      ) : null}
                      {material.status !== "archivado" ? (
                        <form
                          action={setMaterialStatusAction.bind(null, material.id, "archivado")}
                        >
                          <ActionFormButton title="Archivar">
                            <Archive className="h-3.5 w-3.5" />
                          </ActionFormButton>
                        </form>
                      ) : (
                        <form
                          action={setMaterialStatusAction.bind(null, material.id, "borrador")}
                        >
                          <ActionFormButton title="Volver a borrador">
                            <PackageOpen className="h-3.5 w-3.5" />
                          </ActionFormButton>
                        </form>
                      )}
                      <form
                        action={softDeleteMaterialAction.bind(null, material.id)}
                      >
                        <ActionFormButton title="Enviar a la papelera" danger>
                          <Trash2 className="h-3.5 w-3.5" />
                        </ActionFormButton>
                      </form>
                    </div>
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
