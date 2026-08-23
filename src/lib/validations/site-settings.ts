import { z } from "zod";

export const updateSiteSettingSchema = z.object({
  key: z.enum(["about.content"]),
  value: z.string().trim().min(1).max(5000),
  locale: z.enum(["pt-BR"]).default("pt-BR"),
});

export type UpdateSiteSettingInput = z.infer<typeof updateSiteSettingSchema>;
