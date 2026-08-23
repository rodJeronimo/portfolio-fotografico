import sharp from "sharp";

import { putObject } from "@/lib/storage/r2";

const THUMB_WIDTH = 400;
const MEDIUM_WIDTH = 1600;
const BLUR_WIDTH = 16;

export interface ProcessedImage {
  width: number;
  height: number;
  blurDataUrl: string;
}

/**
 * Gera variantes otimizadas (thumbnail/medium em WebP+AVIF) a partir do
 * buffer original e grava no R2 sob {storageKey}/{variant}.{ext}, conforme
 * convenção de docs/architecture/data-model.md. Retorna dimensões originais
 * e o LQIP blur placeholder (base64 inline, sem round-trip ao R2).
 */
export async function processAndUploadVariants(
  buffer: Buffer,
  storageKey: string,
): Promise<ProcessedImage> {
  const original = sharp(buffer, { failOn: "none" });
  const metadata = await original.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const variants: { suffix: string; width: number; format: "webp" | "avif" }[] = [
    { suffix: "thumb.webp", width: THUMB_WIDTH, format: "webp" },
    { suffix: "thumb.avif", width: THUMB_WIDTH, format: "avif" },
    { suffix: "medium.webp", width: MEDIUM_WIDTH, format: "webp" },
    { suffix: "medium.avif", width: MEDIUM_WIDTH, format: "avif" },
  ];

  await Promise.all(
    variants.map(async ({ suffix, width: targetWidth, format }) => {
      const resized = sharp(buffer, { failOn: "none" }).rotate().resize({
        width: targetWidth,
        withoutEnlargement: true,
      });
      const output = format === "webp" ? resized.webp({ quality: 80 }) : resized.avif({ quality: 60 });
      const outBuffer = await output.toBuffer();
      await putObject({
        key: `${storageKey}/${suffix}`,
        body: outBuffer,
        contentType: `image/${format}`,
      });
    }),
  );

  const blurBuffer = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  return { width, height, blurDataUrl };
}
