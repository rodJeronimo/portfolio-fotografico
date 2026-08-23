import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.STORAGE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.STORAGE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_R2_SECRET_ACCESS_KEY,
  },
});

const PRESIGNED_URL_EXPIRY_SECONDS = 5 * 60;

// getPublicUrl() vive em ./public-url.ts, deliberadamente separado deste
// módulo (que instancia o S3Client com credenciais de servidor) — ver
// docs/architecture/known-issues.md.

export async function createPresignedUploadUrl(params: {
  key: string;
  contentType: string;
  contentLength: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.STORAGE_R2_BUCKET_NAME,
    Key: params.key,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
  });
  return getSignedUrl(r2, command, { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: env.STORAGE_R2_BUCKET_NAME, Key: key });
  const response = await r2.send(command);
  const bytes = await response.Body?.transformToByteArray();
  if (!bytes) throw new Error(`Objeto vazio ou não encontrado: ${key}`);
  return Buffer.from(bytes);
}

export async function putObject(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: env.STORAGE_R2_BUCKET_NAME,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: env.STORAGE_R2_BUCKET_NAME, Key: key }));
}

export async function deleteObjects(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteObject(key)));
}
