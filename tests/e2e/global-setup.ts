import { or, like, eq } from "drizzle-orm";

import { db } from "../../src/db/client";
import { project, photo, projectPhoto } from "../../src/db/schema";
import { deleteObject } from "../../src/lib/storage/r2";

/**
 * Varredura defensiva: roda antes E depois da suite (ver playwright.config.ts).
 * Testes que mutam estado real compartilhado podem deixar órfãos se o
 * processo for interrompido no meio (timeout forçado, Ctrl+C) antes do
 * `finally`/`afterAll` rodar — bug real encontrado na TASK-0012.
 */
export default async function sweepE2eData(): Promise<void> {
  const rows = await db
    .select({ id: project.id })
    .from(project)
    .where(or(like(project.slug, "e2e-%"), like(project.slug, "galeria-e2e-%")));

  for (const row of rows) {
    const photos = await db
      .select({ photoId: photo.id, storageKey: photo.storageKey })
      .from(projectPhoto)
      .innerJoin(photo, eq(projectPhoto.photoId, photo.id))
      .where(eq(projectPhoto.projectId, row.id));

    await db.delete(project).where(eq(project.id, row.id));
    for (const p of photos) {
      await db.delete(photo).where(eq(photo.id, p.photoId));
      await Promise.all(
        ["", "/thumb.webp", "/thumb.avif", "/medium.webp", "/medium.avif"].map((s) =>
          deleteObject(`${p.storageKey}${s}`).catch(() => {}),
        ),
      );
    }
  }

  if (rows.length > 0) {
    console.log(`[e2e sweep] removidos ${rows.length} projeto(s) órfão(s) de execuções anteriores.`);
  }
}
