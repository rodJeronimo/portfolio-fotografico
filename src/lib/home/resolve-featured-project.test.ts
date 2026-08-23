import { describe, expect, it } from "vitest";

import {
  parseFeaturedProjectSettingValue,
  resolveFeaturedProjectId,
} from "@/lib/home/resolve-featured-project";

const projects = [{ id: "project-a" }, { id: "project-b" }, { id: "project-c" }];

describe("resolveFeaturedProjectId", () => {
  it("falls back to the first project when no override is configured (undefined)", () => {
    expect(resolveFeaturedProjectId(undefined, projects)).toBe("project-a");
  });

  it("falls back to the first project when the override is null", () => {
    expect(resolveFeaturedProjectId(null, projects)).toBe("project-a");
  });

  it("uses the configured project when it exists in the list", () => {
    expect(resolveFeaturedProjectId("project-b", projects)).toBe("project-b");
  });

  it("falls back to the first project when the configured project no longer exists (deleted)", () => {
    expect(resolveFeaturedProjectId("deleted-project-id", projects)).toBe("project-a");
  });

  it("returns null when there are no projects at all, regardless of the override", () => {
    expect(resolveFeaturedProjectId("any-id", [])).toBeNull();
    expect(resolveFeaturedProjectId(null, [])).toBeNull();
  });

  it("never throws for malformed inputs", () => {
    expect(() => resolveFeaturedProjectId("", projects)).not.toThrow();
    expect(resolveFeaturedProjectId("", projects)).toBe("project-a");
  });
});

describe("parseFeaturedProjectSettingValue", () => {
  it("extracts the projectId from a well-formed value", () => {
    expect(parseFeaturedProjectSettingValue({ projectId: "project-a" })).toBe("project-a");
  });

  it("returns null when projectId is explicitly null", () => {
    expect(parseFeaturedProjectSettingValue({ projectId: null })).toBeNull();
  });

  it("returns null for missing/malformed values without throwing", () => {
    expect(parseFeaturedProjectSettingValue(undefined)).toBeNull();
    expect(parseFeaturedProjectSettingValue(null)).toBeNull();
    expect(parseFeaturedProjectSettingValue("not-an-object")).toBeNull();
    expect(parseFeaturedProjectSettingValue({ other: "field" })).toBeNull();
    expect(parseFeaturedProjectSettingValue({ projectId: 123 })).toBeNull();
  });
});
