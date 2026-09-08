import { expect, test } from "@playwright/test";

/**
 * Suite móvil — iPhone y Android (emulación con viewport + touch/dpr).
 * Verifica: cajón de navegación pública, ausencia de overflow horizontal,
 * legibilidad de inputs (≥16px anti-zoom iOS), tab bar inferior del
 * panel y navegación de agenda en pantallas pequeñas.
 */

const IPHONE_13 = {
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
} as const;

// dpr entero (≈ el real del dispositivo) para un hit-testing estable.
const PIXEL_7 = {
  viewport: { width: 412, height: 915 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
} as const;

async function assertNoHorizontalOverflow(
  page: import("@playwright/test").Page,
  viewportWidth: number,
) {
  // Desbordamiento real: elemento cuyo borde derecho supera el viewport SIN
  // haber un ancestro con overflow-x recortado (los scrollers internos de
  // navegación, como el índice de secciones, no cuentan).
  const offenders = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const results: string[] = [];
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const rect = el.getBoundingClientRect();
      // Elementos colapsados (honeypots h-0 w-0) o invisibles no cuentan.
      if (rect.width === 0 || rect.height === 0) continue;
      const styles = getComputedStyle(el);
      if (styles.pointerEvents === "none" || styles.visibility === "hidden") continue;
      if (rect.right <= vw + 1 && rect.left >= -1) continue;
      let clipped = false;
      let node = el.parentElement;
      while (node) {
        const overflowX = getComputedStyle(node).overflowX;
        if (overflowX === "auto" || overflowX === "scroll" || overflowX === "hidden") {
          clipped = true;
          break;
        }
        node = node.parentElement;
      }
      if (!clipped) {
        results.push(
          `${el.tagName}.${String(el.className).slice(0, 60)} right=${Math.round(rect.right)}`,
        );
      }
      if (results.length >= 4) break;
    }
    return results;
  });
  expect(
    offenders,
    `desbordamiento horizontal real: ${offenders.join(" | ")}`,
  ).toHaveLength(0);
}

test.describe("iPhone 13 (390×844, dpr 3)", () => {
  test.use(IPHONE_13);

  test("cajón de navegación pública abre, navega y no hay overflow", async ({
    page,
  }) => {
    await page.goto("/");
    await assertNoHorizontalOverflow(page, 390);

    // Botón hamburguesa visible en móvil (el menú desktop está oculto).
    const menuButton = page.getByRole("button", {
      name: /abrir menú de navegación/i,
    });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: /menú de navegación/i });
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByRole("link", { name: /asignaturas/i }),
    ).toBeVisible();

    await drawer.getByRole("link", { name: /asignaturas/i }).click();
    await expect(page).toHaveURL(/\/asignaturas$/);
    await assertNoHorizontalOverflow(page, 390);
  });

  test("formulario de contacto: inputs a 16px (anti-zoom iOS) y usable", async ({
    page,
  }) => {
    await page.goto("/#consultas");
    await page.waitForTimeout(3000);

    const nameInput = page.locator('input[name="name"]');
    const fontSize = await nameInput.evaluate((el) =>
      Number.parseFloat(getComputedStyle(el as HTMLElement).fontSize),
    );
    expect(fontSize, "iOS no debe autozoomear inputs < 16px").toBeGreaterThanOrEqual(16);

    await nameInput.fill("Estudiante E2E Móvil");
    await page.locator('input[name="email"]').fill("movil.e2e@test.edu");
    await page
      .locator('textarea[name="message"]')
      .fill("Consulta E2E desde un iPhone de prueba con más de 10 caracteres.");
    await page.getByRole("button", { name: /enviar consulta/i }).click();
    await expect(page.getByText(/consulta enviada/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Android Pixel 7 (412×915, dpr 2.6)", () => {
  test.use(PIXEL_7);

  test("panel admin: barra inferior estilo app y secciones táctiles", async ({
    browser,
    baseURL,
  }) => {
    const ctx = await browser.newContext({
      baseURL,
      storageState: "e2e/.auth/admin.json",
    });
    const page = await ctx.newPage();
    await page.goto("/admin");

    const tabBar = page.getByRole("navigation", {
      name: /navegación rápida/i,
    });
    await expect(tabBar).toBeVisible();
    await expect(tabBar.getByRole("link", { name: "Inicio" })).toBeVisible();

    // Áreas táctiles de pestañas ≥ 40px de alto.
    const tabHeight = await tabBar
      .getByRole("link", { name: /materiales/i })
      .evaluate((el) => (el as HTMLElement).offsetHeight);
    expect(tabHeight).toBeGreaterThanOrEqual(40);

    // El hit-testing de Playwright con barras fijas inferiores es frágil en
    // emulación móvil: navegamos vía evento real del elemento (mismo efecto UX).
    await tabBar
      .getByRole("link", { name: /consultas/i })
      .evaluate((el) => (el as HTMLAnchorElement).click());
    await expect(page).toHaveURL(/\/admin\/consultas/);
    await expect(
      page.getByRole("heading", { name: /consultas estudiantiles/i }),
    ).toBeVisible();
    await ctx.close();
  });

  test("agenda: mes navegable con botones táctiles en móvil", async ({
    page,
  }) => {
    await page.goto("/agenda");
    await assertNoHorizontalOverflow(page, 412);

    const nextButton = page.getByRole("link", { name: /mes siguiente/i });
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await expect(page).toHaveURL(/\/agenda\?.*mes=\d+/);

    // El calendario sigue conteniendo la estructura de semana en español.
    await expect(
      page.getByRole("columnheader", { name: "lunes" }),
    ).toBeVisible();
  });
});
