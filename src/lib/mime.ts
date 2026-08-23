import { fileTypeFromBuffer } from "file-type";

/**
 * Formatos aceitos para upload (origem) — ver docs/architecture/security.md.
 * Nunca confiar em extensão/Content-Type do client: valida magic bytes.
 */
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export async function detectAndValidateImageType(buffer: Buffer): Promise<string> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw new Error(
      `Tipo de arquivo não permitido${detected ? `: ${detected.mime}` : " (não reconhecido)"}. Formatos aceitos: JPEG, PNG, WebP, AVIF.`,
    );
  }
  return detected.mime;
}
