"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq, max } from "drizzle-orm";

import { db } from "@/db/client";
import { photo, project, projectPhoto } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { createPresignedUploadUrl, deleteObject, getObjectBuffer } from "@/lib/storage/r2";
import { detectAndValidateImageType } from "@/lib/mime";
import { extractSanitizedExif } from "@/lib/image-pipeline/exif";
import { processAndUploadVariants } from "@/lib/image-pipeline/process";
import { requestUploadSchema, confirmUploadSchema } from "@/lib/validations/photo";
import type { RequestUploadInput, ConfirmUploadInput } from "@/lib/validations/photo";

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function requestPhotoUpload(
  input: RequestUploadInput,
): Promise<ActionResult<{ uploadUrl: string; storageKey: string }>> {
  const session = await requireAdminSession();

  const rateLimit = checkRateLimit(session.user!.email!);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Muitos uploads em pouco tempo. Aguarde alguns minutos e tente novamente.",
    };
  }

  const parsed = requestUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const storageKey = `photos/${randomUUID()}`;
  const uploadUrl = await createPresignedUploadUrl({
    key: storageKey,
    contentType: parsed.data.contentType,
    contentLength: parsed.data.contentLength,
  });

  return { success: true, data: { uploadUrl, storageKey } };
}

export async function confirmPhotoUpload(input: ConfirmUploadInput): Promise<ActionResult> {
  await requireAdminSession();

  const parsed = confirmUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { projectId, storageKey, title, description, location } = parsed.data;

  let buffer: Buffer;
  try {
    buffer = await getObjectBuffer(storageKey);
  } catch {
    return { success: false, error: "Upload não encontrado no storage. Tente novamente." };
  }

  try {
    await detectAndValidateImageType(buffer);
  } catch (err) {
    await deleteObject(storageKey).catch(() => {});
    return { success: false, error: err instanceof Error ? err.message : "Arquivo inválido." };
  }

  const [exif, processed] = await Promise.all([
    extractSanitizedExif(buffer),
    processAndUploadVariants(buffer, storageKey),
  ]);

  const [inserted] = await db
    .insert(photo)
    .values({
      title: title ?? null,
      description: description ?? null,
      location: location ?? null,
      exifJson: exif,
      captureDate: exif?.captureDate ? exif.captureDate.slice(0, 10) : null,
      storageKey,
      blurDataUrl: processed.blurDataUrl,
      width: processed.width,
      height: processed.height,
    })
    .returning({ id: photo.id });

  if (!inserted) {
    return { success: false, error: "Falha ao gravar metadados." };
  }

  const maxOrderRows = await db
    .select({ maxOrder: max(projectPhoto.displayOrder) })
    .from(projectPhoto)
    .where(eq(projectPhoto.projectId, projectId));
  const maxOrder = maxOrderRows[0]?.maxOrder ?? -1;

  await db.insert(projectPhoto).values({
    projectId,
    photoId: inserted.id,
    displayOrder: maxOrder + 1,
  });

  revalidatePath("/admin/fotos");
  revalidatePublicProject(projectId).catch(() => {});
  return { success: true };
}

export async function deletePhoto(photoId: string): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.query.photo.findFirst({ where: eq(photo.id, photoId) });
  if (!existing) {
    return { success: false, error: "Foto não encontrada." };
  }

  const affectedProjectIds = (
    await db
      .select({ projectId: projectPhoto.projectId })
      .from(projectPhoto)
      .where(eq(projectPhoto.photoId, photoId))
  ).map((r) => r.projectId);

  await Promise.all(
    ["", "/thumb.webp", "/thumb.avif", "/medium.webp", "/medium.avif"].map((suffix) =>
      deleteObject(`${existing.storageKey}${suffix}`).catch(() => {}),
    ),
  );

  await db.delete(photo).where(eq(photo.id, photoId));

  revalidatePath("/admin/fotos");
  await Promise.all(affectedProjectIds.map((id) => revalidatePublicProject(id).catch(() => {})));
  return { success: true };
}

/**
 * Revalida a home e a página pública do projeto após qualquer mutação de
 * foto — ver docs/architecture/caching-strategy.md e upload-flow.md
 * (publicação em <60s, sem novo deploy).
 */
async function revalidatePublicProject(projectId: string): Promise<void> {
  const p = await db.query.project.findFirst({ where: eq(project.id, projectId) });
  revalidatePath("/");
  if (p) revalidatePath(`/projetos/${p.slug}`);
}
