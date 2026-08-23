import { eq } from "drizzle-orm";

import { db } from "../../../src/db/client";
import { project, photo, projectPhoto } from "../../../src/db/schema";
import { processAndUploadVariants } from "../../../src/lib/image-pipeline/process";
import { deleteObject } from "../../../src/lib/storage/r2";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/**
 * Seeding via DB direto bypassa as Server Actions (que chamam revalidatePath
 * sozinhas) — sem isso, a Home/página do projeto ficam presas no cache ISR
 * gerado no build (sem os dados de teste). Ver src/app/api/revalidate/route.ts.
 */
async function revalidate(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AUTH_SECRET}` },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(`Falha ao revalidar ${path}: ${res.status}`);
}

/** Cria um projeto com N fotos reais (Neon+R2) para um teste e2e específico. */
export async function seedProjectWithPhotos(params: {
  title: string;
  slug: string;
  photoBuffers: Buffer[];
}) {
  const [proj] = await db
    .insert(project)
    .values({ title: params.title, slug: params.slug })
    .returning();
  if (!proj) throw new Error("Falha ao semear projeto de teste.");

  const photoIds: string[] = [];
  const storageKeys: string[] = [];

  for (let i = 0; i < params.photoBuffers.length; i++) {
    const buffer = params.photoBuffers[i]!;
    const storageKey = `photos/e2e-${proj.id}-${i}`;
    const processed = await processAndUploadVariants(buffer, storageKey);
    const [ph] = await db
      .insert(photo)
      .values({
        title: `Foto e2e ${i}`,
        storageKey,
        blurDataUrl: processed.blurDataUrl,
        width: processed.width,
        height: processed.height,
      })
      .returning();
    if (!ph) throw new Error("Falha ao semear foto de teste.");
    await db.insert(projectPhoto).values({ projectId: proj.id, photoId: ph.id, displayOrder: i });
    photoIds.push(ph.id);
    storageKeys.push(storageKey);
  }

  await revalidate("/");
  await revalidate(`/projetos/${proj.slug}`);

  return { projectId: proj.id, slug: proj.slug, photoIds, storageKeys };
}

export async function cleanupProject(projectId: string, storageKeys: string[], slug?: string) {
  await db.delete(project).where(eq(project.id, projectId));
  await Promise.all(
    storageKeys.flatMap((key) =>
      ["", "/thumb.webp", "/thumb.avif", "/medium.webp", "/medium.avif"].map((suffix) =>
        deleteObject(`${key}${suffix}`).catch(() => {}),
      ),
    ),
  );
  await revalidate("/").catch(() => {});
  if (slug) await revalidate(`/projetos/${slug}`).catch(() => {});
}
