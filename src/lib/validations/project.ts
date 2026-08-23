import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug obrigatório")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve ser kebab-case (ex.: paisagens-noturnas)"),
  description: z.string().trim().max(2000).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
