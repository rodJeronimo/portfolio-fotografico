import { describe, expect, it } from "vitest";

import { contactFormSchema } from "@/lib/validations/contact";

describe("contactFormSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactFormSchema.safeParse({
      name: "Rodrigo",
      email: "rodrigo@example.com",
      message: "Adorei o trabalho, gostaria de contratar uma sessão.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({
      name: "Rodrigo",
      email: "not-an-email",
      message: "Mensagem válida com mais de dez caracteres.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = contactFormSchema.safeParse({
      name: "Rodrigo",
      email: "rodrigo@example.com",
      message: "oi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when the honeypot field is filled", () => {
    const result = contactFormSchema.safeParse({
      name: "Bot",
      email: "bot@example.com",
      message: "Mensagem qualquer com tamanho suficiente.",
      company: "Acme Inc",
    });
    expect(result.success).toBe(false);
  });

  it("accepts when the honeypot field is empty or absent", () => {
    expect(
      contactFormSchema.safeParse({
        name: "Rodrigo",
        email: "rodrigo@example.com",
        message: "Mensagem qualquer com tamanho suficiente.",
        company: "",
      }).success,
    ).toBe(true);
  });
});
