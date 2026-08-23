import { describe, expect, it } from "vitest";

import { isAllowedEmail, parseAllowlist } from "@/lib/auth/allowlist";

describe("parseAllowlist", () => {
  it("splits a CSV into trimmed, lowercased emails", () => {
    expect(parseAllowlist(" Foo@Example.com , bar@example.com")).toEqual([
      "foo@example.com",
      "bar@example.com",
    ]);
  });

  it("drops empty entries", () => {
    expect(parseAllowlist("foo@example.com,,bar@example.com,")).toEqual([
      "foo@example.com",
      "bar@example.com",
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseAllowlist("")).toEqual([]);
  });
});

describe("isAllowedEmail", () => {
  const allowlist = "rodrigo.jeronimo@msn.com, outro@exemplo.com";

  it("allows an email present in the allowlist", () => {
    expect(isAllowedEmail("rodrigo.jeronimo@msn.com", allowlist)).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAllowedEmail("Rodrigo.Jeronimo@MSN.com", allowlist)).toBe(true);
  });

  it("rejects an email not present in the allowlist", () => {
    expect(isAllowedEmail("attacker@evil.com", allowlist)).toBe(false);
  });

  it("rejects null/undefined email", () => {
    expect(isAllowedEmail(null, allowlist)).toBe(false);
    expect(isAllowedEmail(undefined, allowlist)).toBe(false);
  });

  it("rejects any email when the allowlist is empty", () => {
    expect(isAllowedEmail("rodrigo.jeronimo@msn.com", "")).toBe(false);
  });
});
