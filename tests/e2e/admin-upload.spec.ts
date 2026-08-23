import { test, expect } from "@playwright/test";
import sharp from "sharp";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { eq } from "drizzle-orm";

import { createAuthenticatedContext } from "./helpers/auth";
import { db } from "../../src/db/client";
import { project, photo, projectPhoto } from "../../src/db/schema";
import { deleteObject } from "../../src/lib/storage/r2";

const ADMIN_EMAIL = "rodrigo.jeronimo@msn.com"; // precisa estar em ADMIN_EMAILS

test.describe.configure({ mode: "serial" });

test("fluxo completo: login (bypass) → criar projeto → upload → aparece no admin e no público", async ({
  browser,
}) => {
  test.setTimeout(60_000); // upload real (sharp + R2 + revalidação) é mais lento que o default de 30s.
  const slug = `e2e-upload-${Date.now()}`;
  const title = `Upload E2E ${Date.now()}`;

  // 1. Gera uma foto de teste real em disco (setInputFiles precisa de um path).
  const dir = mkdtempSync(join(tmpdir(), "e2e-photo-"));
  const filePath = join(dir, "foto.jpg");
  const buffer = await sharp({
    create: { width: 1000, height: 700, channels: 3, background: { r: 120, g: 180, b: 90 } },
  })
    .jpeg()
    .toBuffer();
  writeFileSync(filePath, buffer);

  // 2. Contexto autenticado (bypass de OAuth — ver helpers/auth.ts).
  const context = await createAuthenticatedContext(browser, ADMIN_EMAIL);
  const page = await context.newPage();

  try {
    // 3. Cria o projeto pela UI real.
    await page.goto("/admin/projects");
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Slug").fill(slug);
    await page.getByRole("button", { name: "Criar projeto" }).click();
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 });

    // 4. Vai para a gestão de fotos do projeto recém-criado (escopado à linha
    // exata pelo título — robusto mesmo se houver outros projetos na lista).
    await page
      .getByRole("listitem")
      .filter({ hasText: title })
      .getByRole("link", { name: "Gerenciar fotos" })
      .click();
    await expect(page).toHaveURL(/\/admin\/projects\/[^/]+\/fotos/);

    // 5. Upload real via input de arquivo (dispara requestPhotoUpload → PUT no R2 → confirmPhotoUpload).
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.getByText("Foto enviada com sucesso.")).toBeVisible({ timeout: 30_000 });

    // 6. Confirma que a foto aparece na listagem do admin após reload.
    await page.reload();
    await expect(page.locator("img[alt='']").first()).toBeVisible({ timeout: 10_000 });

    // 7. Confirma que a página pública reflete o upload (revalidatePath já disparado pela Server Action).
    const publicPage = await context.newPage();
    await publicPage.goto(`/projetos/${slug}`);
    await expect(publicPage.getByRole("heading", { name: title })).toBeVisible();
    await expect(publicPage.getByRole("button", { name: /Ver foto/ })).toHaveCount(1, {
      timeout: 10_000,
    });
  } finally {
    // 8. Limpeza: remove projeto/foto do Neon e variantes do R2.
    const created = await db.query.project.findFirst({ where: eq(project.slug, slug) });
    if (created) {
      const rows = await db
        .select({ storageKey: photo.storageKey, photoId: photo.id })
        .from(projectPhoto)
        .innerJoin(photo, eq(projectPhoto.photoId, photo.id))
        .where(eq(projectPhoto.projectId, created.id));

      await db.delete(project).where(eq(project.id, created.id));
      await Promise.all(rows.map((r) => db.delete(photo).where(eq(photo.id, r.photoId))));
      await Promise.all(
        rows.flatMap((r) =>
          ["", "/thumb.webp", "/thumb.avif", "/medium.webp", "/medium.avif"].map((suffix) =>
            deleteObject(`${r.storageKey}${suffix}`).catch(() => {}),
          ),
        ),
      );
    }
    await context.close();
  }
});
