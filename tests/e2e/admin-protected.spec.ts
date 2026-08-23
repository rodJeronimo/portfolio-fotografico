import { test, expect } from "@playwright/test";

test("acesso a /admin sem sessão redireciona para /admin/login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Painel administrativo" })).toBeVisible();
});

test("acesso a /admin/projects sem sessão redireciona para /admin/login", async ({ page }) => {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
