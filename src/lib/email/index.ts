/**
 * Envio de e-mail — placeholder até a conta Resend (ou Formspree) existir.
 * Decisão registrada: Resend, por ter SDK simples e integração natural com
 * Server Actions (ver docs/tasks/backlog/TASK-0009-m5-sobre-contato.md).
 *
 * Troca futura: instalar `resend`, substituir o corpo desta função por
 * `new Resend(env.RESEND_API_KEY).emails.send(...)` — a assinatura
 * (parâmetros de entrada, retorno) já foi desenhada para não exigir
 * mudança nos callers quando isso acontecer.
 */

export interface ContactEmailParams {
  name: string;
  email: string;
  message: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendContactEmail(params: ContactEmailParams): Promise<SendEmailResult> {
  console.log("[email:mock] Novo contato recebido", {
    name: params.name,
    email: params.email,
    messagePreview: params.message.slice(0, 100),
  });
  return { success: true };
}
