"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { updateSiteSettingSchema, type UpdateSiteSettingInput } from "@/lib/validations/site-settings";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateSiteSetting(input: UpdateSiteSettingInput): Promise<ActionResult> {
  await requireAdminSession();

  const parsed = updateSiteSettingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db
    .insert(siteSettings)
    .values({ key: parsed.data.key, value: parsed.data.value, locale: parsed.data.locale })
    .onConflictDoUpdate({
      target: [siteSettings.key, siteSettings.locale],
      set: { value: parsed.data.value, updatedAt: new Date() },
    });

  revalidatePath("/admin/settings");
  revalidatePath("/sobre");
  return { success: true };
}
