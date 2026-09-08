"use client";

import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FileUp,
  Files,
  ImagePlus,
  Loader2,
  Plus,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  formatBytes,
  MAX_BULK_FILES,
  MAX_SITE_IMAGE_BYTES,
  MAX_UPLOAD_BYTES,
  SITE_IMAGE_EXTENSIONS,
  validateSiteImageMeta,
  validateUploadMeta,
} from "@/lib/upload-rules";
import { MATERIAL_TYPE_LABELS } from "@/lib/format";
import type { MaterialType } from "@/db/schema";

/* ------------------------------------------------------------------ */
/* Subida individual — alimenta los campos ocultos del formulario      */
/* ------------------------------------------------------------------ */

type UploadedInfo = {
  key: string;
  url: string;
  name: string;
  size: number;
};

export function FileUploadField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<UploadedInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    const meta = validateUploadMeta(file.name, file.type, file.size);
    if (!meta.ok) {
      setError(meta.error);
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as UploadedInfo & {
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo subir el archivo.");
        return;
      }
      setUploaded(payload);
    } catch {
      setError("Fallo de red al subir el archivo. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  if (uploaded) {
    return (
      <div>
        <input type="hidden" name="fileKey" value={uploaded.key} />
        <input type="hidden" name="fileName" value={uploaded.name} />
        <input type="hidden" name="fileSize" value={String(uploaded.size)} />
        <div className="flex items-center gap-3 rounded-xl border border-sage/40 bg-sage/10 px-3.5 py-3">
          <Check className="h-4 w-4 shrink-0 text-sage" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-cream">
              {uploaded.name}
            </p>
            <p className="font-mono text-[10px] text-muted">
              {formatBytes(uploaded.size)} · almacenado con acceso restringido
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUploaded(null)}
            className="rounded-lg border border-line p-1.5 text-sand transition hover:border-clay/50 hover:text-clay"
            title="Quitar archivo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => event.key === "Enter" && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${
          dragging
            ? "border-brass bg-brass/10"
            : "border-line bg-lift/40 hover:border-brass/50"
        }`}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-brass" />
        ) : (
          <UploadCloud className="h-5 w-5 text-brass" strokeWidth={1.5} />
        )}
        <p className="text-sm text-sand">
          {busy ? "Subiendo al almacenamiento…" : "Arrastra un archivo o haz clic"}
        </p>
        <p className="font-mono text-[10px] text-muted">
          {ALLOWED_UPLOAD_EXTENSIONS.join(" · ")} · máx. {formatBytes(MAX_UPLOAD_BYTES)}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={ALLOWED_UPLOAD_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {error ? (
        <p className="mt-2 rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-xs text-clay">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Imágenes editoriales — importación EXCLUSIVA desde el dispositivo   */
/* ------------------------------------------------------------------ */

type SiteImageInfo = UploadedInfo & { previewUrl: string };

function readImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("No se pudo previsualizar la imagen."));
    reader.readAsDataURL(file);
  });
}

export function SiteImageUploadField({
  name,
  label,
  description,
  currentUrl = "",
  aspect = "landscape",
}: {
  name: string;
  label: string;
  description: string;
  currentUrl?: string;
  aspect?: "landscape" | "square";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(
    currentUrl.startsWith("/imagenes/") ? currentUrl : "",
  );
  const [previewUrl, setPreviewUrl] = useState(
    currentUrl.startsWith("/imagenes/") ? currentUrl : "",
  );
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImage(file: File | undefined) {
    setError(null);
    if (!file) return;
    const meta = validateSiteImageMeta(file.name, file.type, file.size);
    if (!meta.ok) {
      setError(meta.error);
      return;
    }

    setBusy(true);
    try {
      const localPreview = await readImagePreview(file);
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/site-image", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as SiteImageInfo & {
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo subir la imagen.");
        return;
      }
      setValue(payload.url);
      setPreviewUrl(localPreview);
      setFileName(payload.name);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Fallo de red al subir la imagen.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clearImage() {
    setValue("");
    setPreviewUrl("");
    setFileName("");
    setError(null);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel">
      <input type="hidden" name={name} value={value} />
      <div className="border-b border-line px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brass/10 text-brass">
            <ImagePlus className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-cream">{label}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              {description}
            </p>
          </div>
        </div>
      </div>

      {previewUrl ? (
        <div className="p-4 sm:p-5">
          <div
            className={`relative overflow-hidden rounded-xl border border-line bg-lift ${
              aspect === "square" ? "aspect-square max-w-xs" : "aspect-[16/9]"
            }`}
          >
            <Image
              src={previewUrl}
              alt={`Vista previa: ${label}`}
              fill
              unoptimized
              className="object-cover"
              sizes={aspect === "square" ? "320px" : "(max-width: 640px) 90vw, 650px"}
            />
            {busy ? (
              <div className="absolute inset-0 flex items-center justify-center bg-night/70">
                <Loader2 className="h-7 w-7 animate-spin text-brass" />
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-sage">
              <ShieldCheck className="h-3.5 w-3.5" />
              {fileName || "Imagen actual del portal"}
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-line px-3 text-xs text-sand transition hover:border-brass/50 hover:text-brass"
              >
                <ImagePlus className="h-3.5 w-3.5" /> Reemplazar
              </button>
              <button
                type="button"
                onClick={clearImage}
                disabled={busy}
                className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-clay/40 px-3 text-xs text-clay transition hover:bg-clay/10"
              >
                <X className="h-3.5 w-3.5" /> Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => !busy && inputRef.current?.click()}
            onKeyDown={(event) =>
              event.key === "Enter" && !busy && inputRef.current?.click()
            }
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void handleImage(event.dataTransfer.files?.[0]);
            }}
            className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition ${
              dragging
                ? "border-brass bg-brass/10"
                : "border-line bg-lift/30 hover:border-brass/50 hover:bg-lift/60"
            }`}
          >
            {busy ? (
              <Loader2 className="h-7 w-7 animate-spin text-brass" />
            ) : (
              <ImagePlus className="h-7 w-7 text-brass" strokeWidth={1.5} />
            )}
            <p className="text-sm font-medium text-cream">
              {busy ? "Importando y protegiendo…" : "Seleccionar desde el dispositivo"}
            </p>
            <p className="max-w-sm text-[11px] leading-relaxed text-muted">
              También puedes arrastrarla aquí · {SITE_IMAGE_EXTENSIONS.map((ext) => ext.toUpperCase()).join(" · ")} · máximo {formatBytes(MAX_SITE_IMAGE_BYTES)}
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={SITE_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        onChange={(event) => void handleImage(event.target.files?.[0])}
      />
      {error ? (
        <p className="mx-4 mb-4 rounded-xl border border-clay/40 bg-clay/10 px-3.5 py-2.5 text-xs text-clay sm:mx-5 sm:mb-5">
          {error}
        </p>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Carga masiva — sube varios archivos y crea un material por archivo  */
/* ------------------------------------------------------------------ */

type CourseOption = { id: string; code: string; title: string };

type BulkResult = {
  created: Array<{ name: string; title: string }>;
  failed: Array<{ name: string; error: string }>;
};

const inputClasses =
  "w-full rounded-xl border border-line bg-lift px-3.5 py-2.5 text-sm text-cream focus:border-brass/60 focus:outline-none focus:ring-2 focus:ring-brass/20";

export function BulkUploadPanel({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setResult(null);
    setFatal(null);
    const incoming = Array.from(list);
    setFiles((prev) => [...prev, ...incoming].slice(0, MAX_BULK_FILES));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit(formData: FormData) {
    const body = new FormData();
    body.set("courseId", String(formData.get("courseId") ?? ""));
    body.set("type", String(formData.get("type") ?? "apunte"));
    body.set("unit", String(formData.get("unit") ?? ""));
    if (formData.get("publish") === "on") body.set("publish", "on");
    for (const file of files) body.append("files", file);

    setBusy(true);
    setFatal(null);
    try {
      const response = await fetch("/api/admin/materiales/bulk", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as BulkResult & {
        error?: string;
      };
      if (!response.ok) {
        setFatal(payload.error ?? "No se pudo completar la carga masiva.");
        return;
      }
      setResult(payload);
      setFiles([]);
      router.refresh();
    } catch {
      setFatal("Fallo de red durante la carga masiva.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-brass/40 bg-brass/10 px-4 py-2.5 text-sm font-semibold text-brass transition hover:bg-brass/20"
      >
        <Files
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-6" : ""}`}
        />
        Carga masiva de archivos
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-2xl border border-line bg-panel">
            <p className="border-b border-line px-6 py-4 font-display text-lg font-medium text-cream">
              Subir un lote completo al repositorio
            </p>
            <form
              className="space-y-4 px-6 py-5"
              onSubmit={(event) => {
                event.preventDefault();
                void submit(new FormData(event.currentTarget));
              }}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-sand">
                    Asignatura destino
                  </span>
                  <select name="courseId" required defaultValue="" className={inputClasses}>
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} — {course.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-sand">
                    Categoría
                  </span>
                  <select name="type" defaultValue="presentacion" className={inputClasses}>
                    {(Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[]).map(
                      (type) => (
                        <option key={type} value={type}>
                          {MATERIAL_TYPE_LABELS[type]}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-sand">
                    Unidad / semana
                  </span>
                  <input
                    name="unit"
                    placeholder="Semana 4"
                    className={inputClasses}
                  />
                </label>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) =>
                  event.key === "Enter" && inputRef.current?.click()
                }
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  addFiles(event.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                  dragging
                    ? "border-brass bg-brass/10"
                    : "border-line bg-lift/40 hover:border-brass/50"
                }`}
              >
                <UploadCloud className="h-6 w-6 text-brass" strokeWidth={1.5} />
                <p className="text-sm text-sand">
                  Arrastra hasta {MAX_BULK_FILES} archivos o haz clic para
                  seleccionarlos
                </p>
                <p className="font-mono text-[10px] text-muted">
                  Cada archivo crea un material con su propia versión y firma de
                  auditoría
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                hidden
                multiple
                accept={ALLOWED_UPLOAD_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />

              {files.length > 0 ? (
                <ul className="divide-y divide-line/60 rounded-xl border border-line">
                  {files.map((file, index) => {
                    const meta = validateUploadMeta(file.name, file.type, file.size);
                    return (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <FileUp className="h-4 w-4 shrink-0 text-muted" />
                        <span className="min-w-0 flex-1 truncate text-sm text-cream">
                          {file.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          {formatBytes(file.size)}
                        </span>
                        {!meta.ok ? (
                          <span className="max-w-56 truncate text-[10px] text-clay">
                            {meta.error}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-muted transition hover:text-clay"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {fatal ? (
                <p className="rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-xs text-clay">
                  {fatal}
                </p>
              ) : null}

              {result ? (
                <div className="space-y-1.5 rounded-xl border border-line bg-lift/40 px-4 py-3 text-xs">
                  <p className="font-medium text-sage">
                    {result.created.length} materiales creados correctamente.
                  </p>
                  {result.failed.map((fail) => (
                    <p key={fail.name} className="text-clay">
                      ✕ {fail.name}: {fail.error}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-sand">
                  <input
                    type="checkbox"
                    name="publish"
                    className="h-4 w-4 rounded border-line bg-lift accent-[#dca63f]"
                  />
                  Publicar todo de inmediato
                </label>
                <button
                  type="submit"
                  disabled={busy || files.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {busy
                    ? "Subiendo lote…"
                    : `Subir ${files.length || ""} ${files.length === 1 ? "archivo" : "archivos"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
