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

export function ProjectGrid({ projects }: { projects: ProjectGridItem[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-muted px-4 py-16 text-center text-sm sm:px-8">
        Nenhum projeto publicado ainda.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-8 lg:grid-cols-4">
      {projects.map((p) => (
        <li key={p.id}>
          <Link href={`/projetos/${p.slug}`} className="group flex flex-col gap-2">
            <div className="bg-surface border-border relative aspect-[4/3] overflow-hidden rounded-md border">
              {p.cover ? (
                <Image
                  src={getPublicUrl(`${p.cover.storageKey}/medium.webp`)}
                  alt={p.title}
                  fill
                  unoptimized
                  {...(p.cover.blurDataUrl
                    ? { placeholder: "blur" as const, blurDataURL: p.cover.blurDataUrl }
                    : {})}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-opacity group-hover:opacity-90"
                />
              ) : (
                <div className="text-muted flex h-full items-center justify-center text-xs">
                  Sem fotos ainda
                </div>
              )}
            </div>
            <span className="text-sm font-medium">{p.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
