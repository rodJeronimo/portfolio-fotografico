"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { project, siteSettings } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { FEATURED_PROJECT_SETTING_KEY } from "@/lib/home/resolve-featured-project";
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
  // The Home reads `home.featuredProjectId` (via getFeaturedProject()) — without this,
  // the public Home stays stale until the next unrelated deploy/ISR cycle.
  if (parsed.data.key === "home.featuredProjectId") {
    revalidatePath("/");
  }
  if (parsed.data.key === "about.content") {
    revalidatePath("/sobre");
  }
  return { success: true };
}

/**
 * Sets (or clears) the Home's explicit featured project override
 * (`site_settings.home.featuredProjectId`, ADR-0007). `projectId: null` restores the
 * automatic behavior (first project by `displayOrder`).
 */
export async function updateFeaturedProject(projectId: string | null): Promise<ActionResult> {
  await requireAdminSession();

  if (projectId !== null) {
    const existing = await db.query.project.findFirst({ where: eq(project.id, projectId) });
    if (!existing) {
      return { success: false, error: "Projeto não encontrado." };
    }
  }

  return updateSiteSetting({
    key: FEATURED_PROJECT_SETTING_KEY,
    value: { projectId },
    locale: "pt-BR",
  });
}
