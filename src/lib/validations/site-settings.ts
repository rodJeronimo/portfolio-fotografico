import { z } from "zod";

export const updateSiteSettingSchema = z.discriminatedUnion("key", [
  z.object({
    key: z.literal("about.content"),
    value: z.string().trim().min(1).max(5000),
    locale: z.enum(["pt-BR"]).default("pt-BR"),
  }),
  z.object({
    key: z.literal("home.featuredProjectId"),
    value: z.object({ projectId: z.string().uuid().nullable() }),
    locale: z.enum(["pt-BR"]).default("pt-BR"),
  }),
]);

export type UpdateSiteSettingInput = z.infer<typeof updateSiteSettingSchema>;
