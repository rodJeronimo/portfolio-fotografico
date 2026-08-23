import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

export const metadata: Metadata = { title: "Sobre" };
export const revalidate = 3600;

export default async function AboutPage() {
  const setting = await db.query.siteSettings.findFirst({
    where: and(eq(siteSettings.key, "about.content"), eq(siteSettings.locale, "pt-BR")),
  });

  const content = typeof setting?.value === "string" ? setting.value : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <h1 className="font-serif text-3xl font-normal tracking-normal sm:text-5xl">Sobre Mim</h1>
      {content ? (
        <p className="text-foreground mt-4 whitespace-pre-line text-base leading-relaxed">
          {content}
        </p>
      ) : (
        <p className="text-muted mt-4 text-sm">Conteúdo em breve.</p>
      )}
    </main>
  );
}
