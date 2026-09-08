import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { query } from "./helpers/db";

/**
 * Flujo #3 — robustez y control de acceso:
 *  - uploads rechazados (demasiado grandes, MIME/extensión, firma mágica),
 *  - panel y APIs protegidas sin sesión,
 *  - archivos en borrador inaccesibles para el público (bucket controlado).
 */

const OVER_MAX = Buffer.alloc(26 * 1024 * 1024, 0x41); // 26 MB > límite 25 MB
const VALID_PDF = Buffer.from("%PDF-1.4\n%%EOF\n", "utf8");

test.describe("robustez de subidas", () => {
  test("archivo demasiado grande → 422", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({
      baseURL,
      storageState: "e2e/.auth/admin.json",
    });
    const response = await ctx.request.post("/api/admin/upload", {
      multipart: {
        file: { name: "gigante.pdf", mimeType: "application/pdf", buffer: OVER_MAX },
      },
    });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(String(body.error)).toContain("supera el límite");
    await ctx.close();
  });

  test("extensión no permitida (.exe) → 422", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({
      baseURL,
      storageState: "e2e/.auth/admin.json",
    });
    const response = await ctx.request.post("/api/admin/upload", {
      multipart: {
        file: { name: "virus.exe", mimeType: "application/x-msdownload", buffer: VALID_PDF },
      },
    });
    expect(response.status()).toBe(422);
    expect(String((await response.json()).error)).toContain("no permitida");
    await ctx.close();
  });

  test("firma inválida (PDF falso) → 422", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({
      baseURL,
      storageState: "e2e/.auth/admin.json",
    });
    const response = await ctx.request.post("/api/admin/upload", {
      multipart: {
        file: {
          name: "mentira.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("ESTO NO ES UN PDF", "utf8"),
        },
      },
    });
    expect(response.status()).toBe(422);
    expect(String((await response.json()).error)).toContain("no coincide");
    await ctx.close();
  });

  test("subida vacía (sin archivo) → 400", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({
      baseURL,
      storageState: "e2e/.auth/admin.json",
    });
    const response = await ctx.request.post("/api/admin/upload", {
      multipart: { otro: "campo" },
    });
    expect(response.status()).toBe(400);
    await ctx.close();
  });
});

test.describe("control de acceso", () => {
  test("panel protegido redirige al login sin sesión", async ({
    browser,
    baseURL,
  }) => {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await page.goto("/admin/materiales");
    await expect(page).toHaveURL(/\/admin\/login/);
    await ctx.close();
  });

  test("APIs de administración rechazan el acceso anónimo", async ({
    browser,
    baseURL,
  }) => {
    const ctx = await browser.newContext({ baseURL });
    expect((await ctx.request.post("/api/admin/upload", { multipart: { f: "x" } })).status()).toBe(401);
    expect((await ctx.request.get("/api/admin/export/respaldo")).status()).toBe(401);
    expect((await ctx.request.get("/api/admin/export/cursos")).status()).toBe(401);
    const bulk = await ctx.request.post("/api/admin/materiales/bulk", { multipart: { f: "x" } });
    expect(bulk.status()).toBe(401);
    await ctx.close();
  });

  test("archivo en borrador: 404 anónimo, 200 con sesión del aula", async ({
    browser,
    baseURL,
  }) => {
    // Preparar un PDF real en el Storage local y registrarlo como borrador.
    const key = `security-draft-${Date.now().toString(36)}.pdf`;
    writeFileSync(
      path.join(process.cwd(), ".storage", "security-draft.pdf"),
      VALID_PDF,
    );
    const [course] = await query<{ id: string }>(
      "SELECT id FROM courses WHERE status = 'publicado' LIMIT 1",
    );
    const [material] = await query<{ id: string }>(
      `INSERT INTO course_materials (course_id, title, type, url, file_key, file_name, file_size, status)
       VALUES ($1, 'E2E borrador', 'apunte', '/archivos/security-draft.pdf', 'security-draft.pdf', 'borrador.pdf', 100, 'borrador')
       RETURNING id`,
      [course.id],
    );
    expect(material?.id).toBeTruthy();

    const anon = await browser.newContext({ baseURL });
    expect((await anon.request.get("/archivos/security-draft.pdf")).status()).toBe(404);

    const admin = await browser.newContext({
      baseURL,
      storageState: "e2e/.auth/admin.json",
    });
    const served = await admin.request.get("/archivos/security-draft.pdf");
    expect(served.status()).toBe(200);
    expect(served.headers()["content-type"]).toContain("application/pdf");

    // Claves inexistentes o con traversal tampoco revelan nada.
    expect((await anon.request.get("/archivos/no-existo.pdf")).status()).toBe(404);
    expect(
      (await anon.request.get("/archivos/..%2F..%2F.env", { maxRedirects: 0 })).status(),
    ).toBeGreaterThanOrEqual(400);

    await query("DELETE FROM course_materials WHERE id = $1", [material.id]);
    await anon.close();
    await admin.close();
  });
});
