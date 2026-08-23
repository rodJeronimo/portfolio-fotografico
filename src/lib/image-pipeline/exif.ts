import exifr from "exifr";

/**
 * Extrai e sanitiza EXIF — apenas subconjunto whitelisted é persistido.
 * GPS é removido por padrão (ver docs/architecture/security.md); localização
 * é campo de texto livre editado manualmente pelo fotógrafo (photo.location).
 */
export interface SanitizedExif {
  camera?: string;
  lens?: string;
  aperture?: string;
  iso?: number;
  shutterSpeed?: string;
  captureDate?: string;
}

export async function extractSanitizedExif(buffer: Buffer): Promise<SanitizedExif | null> {
  let raw: Record<string, unknown> | null = null;
  try {
    raw = await exifr.parse(buffer, {
      pick: ["Make", "Model", "LensModel", "FNumber", "ISO", "ExposureTime", "DateTimeOriginal"],
    });
  } catch {
    return null;
  }
  if (!raw) return null;

  const result: SanitizedExif = {};

  if (raw.Make || raw.Model) {
    result.camera = [raw.Make, raw.Model].filter(Boolean).join(" ").trim();
  }
  if (typeof raw.LensModel === "string") {
    result.lens = raw.LensModel;
  }
  if (typeof raw.FNumber === "number") {
    result.aperture = `f/${raw.FNumber}`;
  }
  if (typeof raw.ISO === "number") {
    result.iso = raw.ISO;
  }
  if (typeof raw.ExposureTime === "number") {
    result.shutterSpeed =
      raw.ExposureTime >= 1 ? `${raw.ExposureTime}s` : `1/${Math.round(1 / raw.ExposureTime)}s`;
  }
  if (raw.DateTimeOriginal instanceof Date) {
    result.captureDate = raw.DateTimeOriginal.toISOString();
  }

  return Object.keys(result).length > 0 ? result : null;
}
