"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";

import { updateFeaturedProject } from "@/app/admin/settings/actions";
import { getPublicUrl } from "@/lib/storage/public-url";
import type { ProjectWithCover } from "@/lib/home/featured-project";

export interface FeaturedProjectFormProps {
  /** All projects ordered by `displayOrder`, each with its resolved cover (or null). */
  projects: ProjectWithCover[];
  /** Admin-configured override, if any — `""` (empty select value) means "Automático". */
  initialSelectedId: string;
  /** The project id that would be picked today if "Automático" is selected (`projects[0]?.id`). */
  automaticProjectId: string | null;
}

function CoverPreview({ project }: { project: ProjectWithCover | null }) {
  if (!project || !project.cover) {
    return (
      <div className="border-border bg-surface flex h-12 w-16 shrink-0 items-center justify-center rounded-md border text-[10px] text-muted">
        Sem foto
      </div>
    );
  }

  return (
    <Image
      src={getPublicUrl(`${project.cover.storageKey}/medium.webp`)}
      alt={`Capa de ${project.title}`}
      width={64}
      height={48}
      unoptimized
      {...(project.cover.blurDataUrl
        ? { placeholder: "blur" as const, blurDataURL: project.cover.blurDataUrl }
        : {})}
      className="border-border h-12 w-16 shrink-0 rounded-md border object-cover"
    />
  );
}

export function FeaturedProjectForm({
  projects,
  initialSelectedId,
  automaticProjectId,
}: FeaturedProjectFormProps) {
  const [selected, setSelected] = useState(initialSelectedId);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const automaticProject = automaticProjectId ? (projectsById.get(automaticProjectId) ?? null) : null;
  const previewProject = selected ? (projectsById.get(selected) ?? null) : automaticProject;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const result = await updateFeaturedProject(selected === "" ? null : selected);
      if (!result.success) {
        setError(result.error ?? "Erro ao salvar.");
        return;
      }
      setStatus("Salvo com sucesso.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border-border mt-2 flex flex-col gap-3 border-t pt-6">
      <h2 className="text-lg font-medium">Destaque da Home</h2>
      <p className="text-sm text-muted">
        Escolha qual projeto aparece em destaque na página inicial. &quot;Automático&quot; usa o
        primeiro projeto pela ordem de exibição.
      </p>

      {projects.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhum projeto cadastrado ainda — crie um projeto em Projetos para poder destacá-lo
          aqui.
        </p>
      ) : null}

      <label htmlFor="featured-project" className="text-sm font-medium">
        Projeto em destaque
      </label>
      <div className="flex items-center gap-3">
        <CoverPreview project={previewProject} />
        <div className="flex flex-1 flex-col gap-1">
          <select
            id="featured-project"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={projects.length === 0}
            className="border-border h-10 rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Automático (ordem de exibição)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} (/{p.slug})
              </option>
            ))}
          </select>
          {selected === "" && automaticProject ? (
            <p className="text-xs text-muted">Atual: {automaticProject.title}</p>
          ) : null}
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
      {status && <p className="text-sm text-green-700">{status}</p>}
      <button
        type="submit"
        disabled={isPending || projects.length === 0}
        className="bg-accent text-accent-foreground min-h-11 self-start rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
