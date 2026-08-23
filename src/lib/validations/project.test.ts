import { describe, expect, it } from "vitest";

import { createProjectSchema } from "@/lib/validations/project";

describe("createProjectSchema", () => {
  it("accepts a valid project", () => {
    const result = createProjectSchema.safeParse({
      title: "Paisagens Noturnas",
      slug: "paisagens-noturnas",
      description: "Fotos de longa exposição à noite.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createProjectSchema.safeParse({ title: "", slug: "slug-valido" });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase or spaces", () => {
    expect(createProjectSchema.safeParse({ title: "X", slug: "Nao Kebab" }).success).toBe(false);
    expect(createProjectSchema.safeParse({ title: "X", slug: "Maiuscula" }).success).toBe(false);
  });

  it("rejects a slug with leading/trailing hyphen", () => {
    expect(createProjectSchema.safeParse({ title: "X", slug: "-invalido" }).success).toBe(false);
    expect(createProjectSchema.safeParse({ title: "X", slug: "invalido-" }).success).toBe(false);
  });

  it("accepts a description-less project", () => {
    const result = createProjectSchema.safeParse({ title: "X", slug: "x" });
    expect(result.success).toBe(true);
  });
});
