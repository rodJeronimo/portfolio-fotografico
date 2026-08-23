import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const id = `user-${Math.random()}`;
    const result = checkRateLimit(id);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it("blocks after exceeding the limit within the window", () => {
    const id = `user-${Math.random()}`;
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(id, now).success).toBe(true);
    }
    const blocked = checkRateLimit(id, now);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window passes", () => {
    const id = `user-${Math.random()}`;
    const now = Date.now();
    for (let i = 0; i < 30; i++) checkRateLimit(id, now);
    expect(checkRateLimit(id, now).success).toBe(false);

    const later = now + 11 * 60 * 1000;
    expect(checkRateLimit(id, later).success).toBe(true);
  });

  it("tracks distinct identifiers independently", () => {
    const now = Date.now();
    const a = `user-a-${Math.random()}`;
    const b = `user-b-${Math.random()}`;
    for (let i = 0; i < 30; i++) checkRateLimit(a, now);
    expect(checkRateLimit(a, now).success).toBe(false);
    expect(checkRateLimit(b, now).success).toBe(true);
  });
});
