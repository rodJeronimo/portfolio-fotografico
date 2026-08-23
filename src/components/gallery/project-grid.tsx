import Image from "next/image";
import Link from "next/link";

import { getPublicUrl } from "@/lib/storage/public-url";

export interface ProjectGridItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: { storageKey: string; blurDataUrl: string | null; width: number; height: number } | null;
}

/**
 * Grid dos projetos restantes na Home (exclui o projeto em destaque, ver
 * src/app/(public)/page.tsx). Cantos retos, sem borda, legenda sempre visível
 * (índice + travessão + título) — docs/design/public-site-redesign.md §5.2.
 */
export function ProjectGrid({ projects }: { projects: ProjectGridItem[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-muted px-4 py-16 text-center text-sm sm:px-8">
        Nenhum projeto publicado ainda.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-6 px-4 sm:grid-cols-3 sm:gap-8 sm:px-8 lg:gap-10 xl:grid-cols-4">
      {projects.map((p, index) => (
        <li key={p.id}>
          <Link href={`/projetos/${p.slug}`} className="group block">
            <figure>
              <div className="bg-surface relative aspect-[4/3] overflow-hidden">
                {p.cover ? (
                  <Image
                    src={getPublicUrl(`${p.cover.storageKey}/medium.webp`)}
                    alt={p.title}
                    fill
                    loading="lazy"
                    unoptimized
                    {...(p.cover.blurDataUrl
                      ? { placeholder: "blur" as const, blurDataURL: p.cover.blurDataUrl }
                      : {})}
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03] motion-safe:group-focus-visible:scale-[1.03]"
                  />
                ) : (
                  <div className="text-muted flex h-full items-center justify-center text-xs">
                    Sem fotos ainda
                  </div>
                )}
              </div>
              <figcaption className="mt-3 flex items-baseline gap-2">
                <span className="text-foreground text-xs font-medium tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground text-xs font-medium" aria-hidden="true">
                  —
                </span>
                <span className="font-serif text-lg text-foreground sm:text-xl">{p.title}</span>
              </figcaption>
            </figure>
          </Link>
        </li>
      ))}
    </ul>
  );
}
