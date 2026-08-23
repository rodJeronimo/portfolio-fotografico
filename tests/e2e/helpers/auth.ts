import { encode } from "@auth/core/jwt";
import type { Browser, BrowserContext } from "@playwright/test";

/**
 * Bypassa o fluxo OAuth real (GitHub) para testes e2e: gera um JWT de
 * sessão válido com o mesmo AUTH_SECRET da aplicação e injeta como cookie
 * antes de navegar. Padrão recomendado para testar rotas protegidas por
 * Auth.js sem depender de credenciais reais de terceiros em CI.
 * Ver docs/tasks/backlog/TASK-0012-m8-e2e-hardening.md.
 */
export async function createAuthenticatedContext(browser: Browser, email: string): Promise<BrowserContext> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não definido no ambiente de teste.");

  const cookieName = "authjs.session-token";
  const token = await encode({
    secret,
    salt: cookieName,
    token: {
      email,
      name: "E2E Test User",
      sub: "e2e-test-user",
    },
  });

  const context = await browser.newContext();
  await context.addCookies([
    {
      name: cookieName,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  return context;
}
