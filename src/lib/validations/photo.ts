import { z } from "zod";

import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/mime";

export const requestUploadSchema = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  contentLength: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_SIZE_BYTES, "Arquivo excede o limite de 25MB"),
});

export type RequestUploadInput = z.infer<typeof requestUploadSchema>;

export const confirmUploadSchema = z.object({
  projectId: z.string().uuid(),
  storageKey: z.string().trim().min(1),
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(200).optional(),
});

export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
