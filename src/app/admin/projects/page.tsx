import Link from "next/link";

import { db } from "@/db/client";
import { ProjectForm } from "@/app/admin/projects/project-form";

// Admin sempre precisa de dado fresco (operador único, sem tolerância a cache).
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await db.query.project.findMany({
    orderBy: (p, { asc }) => [asc(p.displayOrder), asc(p.createdAt)],
  });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>

      <ProjectForm />

      <ul className="flex flex-col gap-2">
        {projects.length === 0 && (
          <li className="text-muted text-sm">Nenhum projeto criado ainda.</li>
        )}
        {projects.map((p) => (
          <li key={p.id} className="border-border flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-muted text-xs">/{p.slug}</p>
            </div>
            <Link href={`/admin/fotos?projectId=${p.id}`} className="text-accent text-sm underline">
              Gerenciar fotos
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
