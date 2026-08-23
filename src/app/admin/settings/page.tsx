import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { SettingsForm } from "@/app/admin/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const setting = await db.query.siteSettings.findFirst({
    where: and(eq(siteSettings.key, "about.content"), eq(siteSettings.locale, "pt-BR")),
  });

  const initialContent =
    typeof setting?.value === "string" ? setting.value : "";

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações do site</h1>
      <SettingsForm initialContent={initialContent} />
    </main>
  );
}
