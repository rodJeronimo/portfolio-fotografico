"use server";

import { headers } from "next/headers";

import { checkRateLimit } from "@/lib/rate-limit";
import { sendContactEmail } from "@/lib/email";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/contact";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(input: ContactFormInput): Promise<ActionResult> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  // Honeypot preenchido → provável bot. Responde sucesso genérico (não
  // revela a heurística de anti-spam) sem enviar e-mail nem gastar rate limit.
  if (parsed.data.company) {
    return { success: true };
  }

  const requestHeaders = await headers();
  const identifier = requestHeaders.get("x-forwarded-for") ?? "unknown";
  const rateLimit = checkRateLimit(`contact:${identifier}`);
  if (!rateLimit.success) {
    return { success: false, error: "Muitas mensagens enviadas. Tente novamente mais tarde." };
  }

  const result = await sendContactEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  if (!result.success) {
    return { success: false, error: "Não foi possível enviar sua mensagem. Tente novamente." };
  }

  return { success: true };
}
