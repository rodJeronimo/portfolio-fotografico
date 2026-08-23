/**
 * Smoke test manual (não faz parte da suite automatizada) — valida a
 * lógica de negócio de upload/pipeline contra Neon+R2 reais, sem passar
 * pela UI/auth (que exigem sessão de navegador). Roda e limpa depois.
 *
 * Uso: npx tsx --env-file=.env.local scripts/smoke-test-upload-pipeline.ts
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "../src/db/client";
import { project, photo, projectPhoto } from "../src/db/schema";
import { detectAndValidateImageType } from "../src/lib/mime";
import { extractSanitizedExif } from "../src/lib/image-pipeline/exif";
import { processAndUploadVariants } from "../src/lib/image-pipeline/process";
import { getPublicUrl, deleteObject } from "../src/lib/storage/r2";

async function main() {
  const buffer = readFileSync("/tmp/test-photo.jpg");

  console.log("1. Validando magic bytes...");
  const mime = await detectAndValidateImageType(buffer);
  console.log("   OK:", mime);

  console.log("2. Extraindo EXIF (esperado: null, imagem sintética sem EXIF)...");
  const exif = await extractSanitizedExif(buffer);
  console.log("   OK:", exif);

  const storageKey = `photos/smoke-test-${randomUUID()}`;
  console.log("3. Processando variantes e enviando ao R2...", storageKey);
  const processed = await processAndUploadVariants(buffer, storageKey);
  console.log("   OK:", processed);

  console.log("4. Verificando variante pública (thumb.webp)...");
  const url = getPublicUrl(`${storageKey}/thumb.webp`);
  const res = await fetch(url);
  console.log("   OK:", url, res.status, res.headers.get("content-type"));
  if (!res.ok) throw new Error(`Variante pública não acessível: ${res.status}`);

  console.log("5. Criando projeto + foto + associação no Neon...");
  const [proj] = await db
    .insert(project)
    .values({ title: "Smoke Test", slug: `smoke-test-${Date.now()}` })
    .returning();
  if (!proj) throw new Error("Falha ao criar projeto de teste");

  const [ph] = await db
    .insert(photo)
    .values({
      storageKey,
      blurDataUrl: processed.blurDataUrl,
      width: processed.width,
      height: processed.height,
      exifJson: exif,
    })
    .returning();
  if (!ph) throw new Error("Falha ao criar foto de teste");

  await db.insert(projectPhoto).values({ projectId: proj.id, photoId: ph.id, displayOrder: 0 });
  console.log("   OK: project=", proj.id, "photo=", ph.id);

  console.log("6. Limpando (DB + R2)...");
  await db.delete(project).where(eq(project.id, proj.id));
  await db.delete(photo).where(eq(photo.id, ph.id));
  await Promise.all(
    ["", "/thumb.webp", "/thumb.avif", "/medium.webp", "/medium.avif"].map((s) =>
      deleteObject(`${storageKey}${s}`),
    ),
  );
  console.log("   OK");

  console.log("\n✅ SMOKE TEST PASSOU — pipeline de upload validado contra Neon+R2 reais.");
}

main().catch((err) => {
  console.error("\n❌ SMOKE TEST FALHOU:", err);
  process.exit(1);
});
