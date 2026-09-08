import { defineConfig } from "@playwright/test";

/**
 * Suite E2E — Aula Docente.
 *
 *   Local:    npx playwright test          (arranca `npm run start` solo)
 *   Remoto:   PLAYWRIGHT_BASE_URL=https://mi-preview npx playwright test
 *
 * Los tests comparten la base de datos de la instancia objetivo: el
 * global setup crea una sesión administrativa programática y el
 * teardown elimina todos los artefactos E2E-* generados.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 1, // secuencial: la suite comparte una única base de datos viva
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global.setup.ts",
  globalTeardown: "./e2e/global.teardown.ts",
  use: {
    baseURL,
    locale: "es-ES",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: "npm run start",
          url: `${baseURL}/api/health`,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});

export const AUTH_STORAGE = "e2e/.auth/admin.json";
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "wilmer@aula.edu";
export const ADMIN_PASSWORD =
  process.env.E2E_ADMIN_PASSWORD ?? "Aula#2026";
