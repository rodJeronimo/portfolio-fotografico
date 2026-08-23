import { defineConfig, devices } from "@playwright/test";

// Quando PLAYWRIGHT_BASE_URL aponta pra um preview remoto (deploy real na
// Vercel, ver e2e.yml), não faz sentido subir + buildar um servidor local
// também — o job de e2e para PRs em main nem tem as env vars de build.
const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  // Serial: os testes mutam estado real compartilhado (Neon + R2), não bancos
  // isolados por teste — paralelismo causa beforeAll duplicado e dados
  // colidindo entre workers (bug real encontrado na TASK-0012).
  fullyParallel: false,
  workers: 1,
  // Varredura de órfãos antes/depois da suite — ver global-setup.ts.
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-setup.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Roda contra build de produção real (não `next dev`): elimina flakiness de
  // compilação on-demand / hidratação lenta na primeira visita de cada rota,
  // e é mais fiel ao que roda de fato em produção.
  ...(remoteBaseUrl
    ? {}
    : {
        webServer: {
          command: "npm run build && npm run start",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }),
});
