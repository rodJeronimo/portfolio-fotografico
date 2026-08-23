import { describe, expect, it } from "vitest";

import { requestUploadSchema } from "@/lib/validations/photo";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/mime";

const projectId = "11111111-1111-4111-8111-111111111111";

describe("requestUploadSchema", () => {
  it("accepts a valid request", () => {
    const result = requestUploadSchema.safeParse({
      projectId,
      fileName: "foto.jpg",
      contentType: "image/jpeg",
      contentLength: 1024,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a file over the size limit", () => {
    const result = requestUploadSchema.safeParse({
      projectId,
      fileName: "foto.jpg",
      contentType: "image/jpeg",
      contentLength: MAX_UPLOAD_SIZE_BYTES + 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid projectId", () => {
    const result = requestUploadSchema.safeParse({
      projectId: "not-a-uuid",
      fileName: "foto.jpg",
      contentType: "image/jpeg",
      contentLength: 1024,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero or negative content length", () => {
    expect(
      requestUploadSchema.safeParse({
        projectId,
        fileName: "foto.jpg",
        contentType: "image/jpeg",
        contentLength: 0,
      }).success,
    ).toBe(false);
  });
});
