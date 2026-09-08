import { expect, test } from "@playwright/test";

/**
 * Sección de simulaciones: visor molecular nativo + conector Google Sites.
 */

test.describe("simulaciones de compuestos", () => {
  test("sección presente con presetes y cambio de compuesto", async ({ page }) => {
    await page.goto("/#simulaciones");

    const section = page.locator("#simulaciones");
    await expect(
      section.getByRole("heading", { level: 2 }),
    ).toBeVisible();

    // Pestañas con los compuestos predefinidos.
    const tabs = section.getByRole("tab");
    await expect(tabs).toHaveCount(6);

    // El compuesto activo por defecto es el agua.
    await expect(
      section.getByRole("heading", { name: "Agua", level: 3 }),
    ).toBeVisible();
    await expect(section.getByText(/104,5°/).first()).toBeVisible();

    // Cambiar a dióxido de carbono actualiza la ficha (geometría lineal).
    await section.getByRole("tab", { name: /CO₂/ }).click();
    await expect(
      section.getByRole("heading", { name: "Dióxido de carbono", level: 3 }),
    ).toBeVisible();
    await expect(section.getByText(/Lineal · 180°/)).toBeVisible();

    // Y benceno muestra el anillo aromático.
    await section.getByRole("tab", { name: /C₆H₆/ }).click();
    await expect(
      section.getByRole("heading", { name: "Benceno", level: 3 }),
    ).toBeVisible();
    await expect(section.getByText(/Anillo aromático plano/)).toBeVisible();
  });

  test("sin URL configurada no hay iframe de Google Sites", async ({ page }) => {
    await page.goto("/#simulaciones");
    const section = page.locator("#simulaciones");
    // En la semilla/preview no hay URL de Google Sites: no debe existir iframe.
    await expect(section.locator("iframe")).toHaveCount(0);
    // El link del índice incluye la sección 03.
    await expect(
      page.getByRole("navigation", { name: /índice/i }).getByRole("link", {
        name: /simulaciones/i,
      }),
    ).toBeVisible();
  });
});
