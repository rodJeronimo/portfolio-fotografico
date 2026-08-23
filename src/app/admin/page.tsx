import { Suspense } from "react";
import Link from "next/link";
import { count } from "drizzle-orm";

import { db } from "@/db/client";
import { photo, project } from "@/db/schema";

// Admin sempre precisa de dado fresco (operador único, sem tolerância a cache).
export const dynamic = "force-dynamic";

const CARD_CLASSNAME =
  "focus-visible:ring-accent hover:border-accent hover:bg-surface block rounded-md border border-border p-4 focus-visible:ring-2 focus-visible:ring-offset-2 sm:p-5";

export default function AdminHomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted text-sm">Escolha uma área para gerenciar.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/projects" className={CARD_CLASSNAME}>
          <p className="text-base font-medium text-foreground">Projetos</p>
          <p className="text-muted mt-1 text-sm">
            Criar, editar e organizar os projetos do portfólio.
          </p>
          <Suspense fallback={<span className="text-muted mt-2 block text-xs">—</span>}>
            <ProjectsCount />
          </Suspense>
        </Link>

        <Link href="/admin/settings" className={CARD_CLASSNAME}>
          <p className="text-base font-medium text-foreground">Configurações</p>
          <p className="text-muted mt-1 text-sm">
            Editar o conteúdo da página Sobre e demais textos do site.
          </p>
        </Link>
      </div>
    </main>
  );
}

// Enhancement opcional (ver docs/design/admin-dashboard.md seção 3.2/3.4): contagem
// de projetos/fotos isolada em Suspense própria, com falha silenciosa — nunca
// bloqueia ou quebra a renderização do card "Projetos".
async function ProjectsCount() {
  const counts = await getProjectsAndPhotosCount();
  if (!counts) {
    return null;
  }

  return (
    <p className="text-muted mt-2 text-xs">
      {counts.projects} {counts.projects === 1 ? "projeto" : "projetos"} ·{" "}
      {counts.photos} {counts.photos === 1 ? "foto" : "fotos"}
    </p>
  );
}

async function getProjectsAndPhotosCount() {
  try {
    const [[projectsRow], [photosRow]] = await Promise.all([
      db.select({ value: count() }).from(project),
      db.select({ value: count() }).from(photo),
    ]);

    return {
      projects: projectsRow?.value ?? 0,
      photos: photosRow?.value ?? 0,
    };
  } catch {
    return null;
  }
}
