import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(200),
  email: z.string().trim().email("E-mail inválido").max(200),
  message: z.string().trim().min(10, "Mensagem muito curta").max(4000),
  // honeypot — campo invisível ao usuário real; bots costumam preenchê-lo.
  company: z.string().max(0, "").optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
