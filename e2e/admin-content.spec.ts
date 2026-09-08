import { expect, test } from "@playwright/test";

/**
 * Flujo crítico #1 — extremo a extremo por la interfaz real:
 *   Login del profesor → crear curso → subir PDF de guía de laboratorio
 *   → publicar → verificar visualización y descarga pública inmediata.
 * También valida los atributos de seguridad de la cookie de sesión.
 */

const STAMP = Date.now().toString(36).toUpperCase();
const CODE = `E2E-${STAMP}`;
const TITLE = `Curso E2E ${STAMP}`;
const SLUG = `curso-e2e-${STAMP.toLowerCase()}`;
const MATERIAL_TITLE = `Guía de prácticas E2E ${STAMP}`;

const TINY_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF\n",
  "utf8",
);

test("login → crear curso → subir PDF → publicar → visible y descargable", async ({
  page,
  context,
  baseURL,
}) => {
  /* ── 1. Login del profesor por la UI real ─────────────────────── */
  await page.goto("/admin/login");
  await expect(page).toHaveTitle(/Acceso al panel docente/);
  await page
    .getByLabel(/contraseña/i)
    .fill(process.env.E2E_ADMIN_PASSWORD ?? "Aula#2026");
  await page.getByRole("button", { name: /entrar al panel/i }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /hola, wilmer/i })).toBeVisible();

  /* ── 1b. Cookie segura: httpOnly, SameSite=Lax, Secure, path=/ ── */
  const cookies = await context.cookies();
  const sessionCookie = cookies.find(
    (cookie) => cookie.name === "docencia_session",
  );
  expect(sessionCookie, "debe existir la cookie de sesión").toBeTruthy();
  expect(sessionCookie!.httpOnly).toBe(true);
  expect(sessionCookie!.sameSite).toBe("Lax");
  expect(sessionCookie!.path).toBe("/");
  if (baseURL?.startsWith("https")) {
    expect(sessionCookie!.secure, "Secure obligatorio bajo HTTPS").toBe(true);
  }

  /* ── 2. Crear un nuevo curso ──────────────────────────────────── */
  await page.goto("/admin/cursos");
  await page.getByRole("button", { name: /nueva asignatura/i }).click();
  await page.locator('input[name="code"]').fill(CODE);
  await page.locator('input[name="title"]').fill(TITLE);
  await page.locator('select[name="level"]').selectOption("grado");
  await page.locator('input[name="term"]').fill("2026-I");
  await page.locator('input[name="credits"]').fill("3");
  await page.locator('input[name="room"]').fill("Lab. E2E");
  await page.getByRole("button", { name: /crear asignatura/i }).click();
  await expect(
    page.getByText(/cambios guardados correctamente/i).first(),
  ).toBeVisible();

  /* Publicar el curso desde la tabla */
  await expect(page.getByRole("row", { name: new RegExp(CODE) })).toBeVisible();
  await page
    .getByRole("row", { name: new RegExp(CODE) })
    .getByTitle("Publicar")
    .click();
  await expect(
    page.getByRole("row", { name: new RegExp(CODE) }),
  ).toContainText("Publicado", { timeout: 15_000 });

  /* ── 3. Subir PDF de guía de laboratorio ──────────────────────── */
  await page.goto("/admin/materiales");
  await page.getByRole("button", { name: /nuevo material/i }).click();

  // El formulario de alta individual es el único con campo «title».
  const form = page.locator('form:has(input[name="title"])');
  await form
    .locator('select[name="courseId"]')
    .selectOption({ label: `${CODE} — ${TITLE}` });
  await form.locator('select[name="type"]').selectOption("laboratorio");
  await form.locator('input[name="title"]').fill(MATERIAL_TITLE);
  await form.locator('input[name="unit"]').fill("Unidad E2E");

  // Zona de subida del formulario (drag & drop + selector).
  await form.locator('input[type="file"]').setInputFiles({
    name: "guia-e2e.pdf",
    mimeType: "application/pdf",
    buffer: TINY_PDF,
  });
  await expect(
    page.getByText("guia-e2e.pdf", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  // La URL externa queda vacía: el servidor decide por fileKey.
  await form.getByText(/visible públicamente/i).click();
  await page.getByRole("button", { name: /guardar material/i }).click();
  await expect(
    page.getByText(/cambios guardados correctamente/i).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: new RegExp(STAMP) }),
  ).toContainText("Publicado");

  /* ── 4. Vista pública de estudiantes: visible y descargable ───── */
  await page.goto(`/cursos/${SLUG}`);
  await expect(
    page.getByRole("heading", { name: TITLE, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Guía de prácticas").first()).toBeVisible();

  const download = page.getByRole("link", { name: new RegExp(STAMP) }).first();
  await expect(download).toBeVisible();
  const href = await download.getAttribute("href");
  expect(href).toMatch(/^\/archivos\//);

  // Descarga inmediata: la ruta protegida sirve el PDF con su MIME.
  const response = await context.request.get(`${baseURL}${href}`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  const body = await response.body();
  expect(body.subarray(0, 5).toString()).toBe("%PDF-");
});
