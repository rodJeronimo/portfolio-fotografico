import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { SettingsForm } from "@/app/admin/settings/settings-form";
import { FeaturedProjectForm } from "@/app/admin/settings/featured-project-form";
import {
  getConfiguredFeaturedProjectId,
  listProjectsWithCover,
  resolveFeaturedProjectId,
} from "@/lib/home/featured-project";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [setting, configuredFeaturedProjectId, projects] = await Promise.all([
    db.query.siteSettings.findFirst({
      where: and(eq(siteSettings.key, "about.content"), eq(siteSettings.locale, "pt-BR")),
    }),
    getConfiguredFeaturedProjectId(),
    listProjectsWithCover(),
  ]);

  const initialContent =
    typeof setting?.value === "string" ? setting.value : "";

  // "Automatic" means the admin override is unset or no longer points to an existing
  // project — same resolution the public Home uses (first project by `displayOrder`).
  const initialSelectedId =
    configuredFeaturedProjectId && projects.some((p) => p.id === configuredFeaturedProjectId)
      ? configuredFeaturedProjectId
      : "";
  const automaticProjectId = resolveFeaturedProjectId(null, projects);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações do site</h1>
      <SettingsForm initialContent={initialContent} />
      <FeaturedProjectForm
        projects={projects}
        initialSelectedId={initialSelectedId}
        automaticProjectId={automaticProjectId}
      />
    </main>
  );
}
