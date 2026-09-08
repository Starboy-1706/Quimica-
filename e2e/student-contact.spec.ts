import { expect, test } from "@playwright/test";
import { query } from "./helpers/db";

/**
 * Flujo crítico #2 — la consulta del estudiante:
 *   envío desde la web pública → recepción en la bandeja del panel.
 * Además: honeypot antispam y robustez ante el formulario vacío.
 */

const SENDER_NAME = "Estudiante E2E";
const SENDER_EMAIL = "estudiante.e2e@test.edu";
const UNIQUE_NOTE = `duda con la titulación ${Date.now().toString(36)}`;

test.describe("consulta de estudiante", () => {
  test("envío público correcto → visible en el panel", async ({
    browser,
    baseURL,
  }) => {
    /* ── Envío desde la web pública ─────────────────────────────── */
    const publicCtx = await browser.newContext({ baseURL });
    const page = await publicCtx.newPage();
    await page.goto("/#consultas");
    await page.waitForTimeout(3200); // la trampa temporal exige > 2,5 s

    await page.locator('input[name="name"]').fill(SENDER_NAME);
    await page.locator('input[name="email"]').fill(SENDER_EMAIL);
    await page.locator('input[name="subject"]').fill("Duda sobre la titulación");
    await page
      .locator('textarea[name="message"]')
      .fill(`Profesor, tengo una ${UNIQUE_NOTE}. ¿Podría revisarlo?`);
    await page.getByRole("button", { name: /enviar consulta/i }).click();
    await expect(
      page.getByText(/consulta enviada/i),
    ).toBeVisible({ timeout: 15_000 });

    // Persistencia real en la bandeja con estado «nuevo».
    const rows = await query<{ id: string; status: string }>(
      "SELECT id, status FROM contact_messages WHERE email = $1 AND message LIKE $2",
      [SENDER_EMAIL, `%${UNIQUE_NOTE}%`],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe("nuevo");
    await publicCtx.close();

    /* ── Recepción en el panel administrativo ───────────────────── */
    const adminCtx = await browser.newContext({
      baseURL,
      storageState: "e2e/.auth/admin.json",
    });
    const adminPage = await adminCtx.newPage();
    await adminPage.goto("/admin/consultas?estado=nuevo");
    await expect(
      adminPage.getByText(SENDER_NAME).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      adminPage.getByText(/duda sobre la titulación/i).first(),
    ).toBeVisible();
    await expect(
      adminPage.getByText(/bandeja de entrada|consultas estudiantiles/i).first(),
    ).toBeVisible();
    await adminCtx.close();
  });

  test("honeypot antispam: éxito silencioso sin persistir", async ({
    browser,
    baseURL,
  }) => {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await page.goto("/#consultas");
    await page.waitForTimeout(3000);

    await page.locator('input[name="name"]').fill(`${SENDER_NAME} Bot`);
    await page.locator('input[name="email"]').fill(SENDER_EMAIL);
    await page
      .locator('textarea[name="message"]')
      .fill(`spam bot ${UNIQUE_NOTE} con enlace malicioso`);
    // Bot típico: rellena el campo trampa oculto manipulando el DOM.
    await page.locator('input[name="website"]').evaluate((el) => {
      (el as HTMLInputElement).value = "https://spam.example";
    });

    await page.getByRole("button", { name: /enviar consulta/i }).click();
    await expect(
      page.getByText(/consulta enviada/i),
    ).toBeVisible({ timeout: 15_000 }); // silencio deliberado

    const rows = await query(
      "SELECT id FROM contact_messages WHERE message LIKE $1",
      [`spam bot %${UNIQUE_NOTE}%`],
    );
    expect(rows.length, "el honeypot no debe persistir").toBe(0);
    await ctx.close();
  });

  test("formulario vacío: la validación nativa bloquea el envío", async ({
    browser,
    baseURL,
  }) => {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await page.goto("/#consultas");

    await page.getByRole("button", { name: /enviar consulta/i }).click();
    await expect(page.getByText(/consulta enviada/i)).not.toBeVisible();

    const nameMissing = await page
      .locator('input[name="name"]')
      .evaluate((el) => (el as HTMLInputElement).validity.valueMissing);
    const emailMissing = await page
      .locator('input[name="email"]')
      .evaluate((el) => (el as HTMLInputElement).validity.valueMissing);
    expect(nameMissing).toBe(true);
    expect(emailMissing).toBe(true);

    const rows = await query(
      "SELECT COUNT(*)::int AS n FROM contact_messages WHERE name = ''",
    );
    expect((rows[0] as { n: number }).n).toBe(0);
    await ctx.close();
  });
});
