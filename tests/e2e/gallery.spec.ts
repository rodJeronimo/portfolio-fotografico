import { test, expect } from "@playwright/test";
import sharp from "sharp";

import { seedProjectWithPhotos, cleanupProject } from "./helpers/seed";

let seeded: Awaited<ReturnType<typeof seedProjectWithPhotos>>;

test.beforeAll(async () => {
  const makePhoto = (r: number, g: number, b: number) =>
    sharp({ create: { width: 800, height: 600, channels: 3, background: { r, g, b } } })
      .jpeg()
      .toBuffer();

  const photoBuffers = await Promise.all([
    makePhoto(200, 50, 50),
    makePhoto(50, 200, 50),
    makePhoto(50, 50, 200),
  ]);

  seeded = await seedProjectWithPhotos({
    title: "Galeria E2E",
    slug: `galeria-e2e-${Date.now()}`,
    photoBuffers,
  });
});

test.afterAll(async () => {
  await cleanupProject(seeded.projectId, seeded.storageKeys, seeded.slug);
});

test("navega até o projeto pela home e abre o lightbox", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Galeria E2E" }).click();
  await expect(page).toHaveURL(`/projetos/${seeded.slug}`);
  await expect(page.getByRole("heading", { name: "Galeria E2E" })).toBeVisible();

  const thumbnails = page.getByRole("button", { name: /Ver foto/ });
  await expect(thumbnails).toHaveCount(3);

  await thumbnails.first().click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
});

test("lightbox: seta direita navega e ESC fecha devolvendo o foco", async ({ page }) => {
  await page.goto(`/projetos/${seeded.slug}`);
  const firstThumb = page.getByRole("button", { name: /Ver foto/ }).first();
  await firstThumb.click();

  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("button", { name: "Anterior" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(firstThumb).toBeFocused();
});

test("breadcrumb volta para a home", async ({ page }) => {
  await page.goto(`/projetos/${seeded.slug}`);
  await page.getByRole("link", { name: "Início" }).click();
  await expect(page).toHaveURL("/");
});
