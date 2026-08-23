import Image from "next/image";
import Link from "next/link";

import { getFeaturedProject, listProjectsWithCover } from "@/lib/home/featured-project";
import { ProjectGrid } from "@/components/gallery/project-grid";
import { getPublicUrl } from "@/lib/storage/public-url";

// Fallback de segurança — invalidação real acontece via revalidatePath no upload/CRUD (ver actions.ts).
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, allProjects] = await Promise.all([getFeaturedProject(), listProjectsWithCover()]);

  if (!featured) {
    return (
      <div className="px-4 py-16 text-center sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Portfólio Fotográfico</h1>
        <p className="text-muted mx-auto mt-2 max-w-md text-base">
          Fotografia de natureza — paisagens, macro, vida selvagem e long exposure.
        </p>
        <p className="text-muted px-4 py-16 text-center text-sm sm:px-8">
          Nenhum projeto publicado ainda.
        </p>
      </div>
    );
  }

  const remaining = allProjects.filter((p) => p.id !== featured.id);
  const featuredHref = `/projetos/${featured.slug}`;

  return (
    <div>
      <section>
        <div className="relative h-[70vh] sm:h-[80vh] lg:h-dvh">
          <Link
            href={featuredHref}
            aria-label={`Ver projeto ${featured.title}`}
            className="absolute inset-0 block"
          >
            {featured.cover ? (
              <Image
                src={getPublicUrl(`${featured.cover.storageKey}/medium.webp`)}
                alt=""
                fill
                priority
                fetchPriority="high"
                unoptimized
                {...(featured.cover.blurDataUrl
                  ? { placeholder: "blur" as const, blurDataURL: featured.cover.blurDataUrl }
                  : {})}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="bg-surface text-muted flex h-full items-center justify-center text-sm">
                Sem fotos ainda
              </div>
            )}
          </Link>

          {/* Seta de scroll — âncora real, beneficia navegação por teclado (docs/design/public-site-redesign.md §5.1). */}
          {remaining.length > 0 && (
            <a
              href="#projetos-restantes"
              className="absolute inset-x-0 bottom-4 flex justify-center sm:bottom-6"
            >
              <span className="sr-only">Ver mais projetos</span>
              <svg
                aria-hidden="true"
                className="motion-safe:animate-scroll-cue text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>
          )}
        </div>

        <div className="px-4 pt-8 sm:px-8 sm:pt-10 lg:px-10">
          <p className="text-foreground text-xs font-medium uppercase tracking-[0.14em]">
            Projeto em destaque
          </p>
          <Link href={featuredHref} className="group mt-2 block w-fit">
            <h1 className="font-serif text-4xl leading-[1.05] font-medium text-foreground sm:text-6xl lg:text-7xl group-hover:text-accent">
              {featured.title}
            </h1>
          </Link>
          {featured.description && (
            <p className="text-muted mt-4 max-w-2xl text-base sm:text-lg">{featured.description}</p>
          )}
        </div>
      </section>

      {remaining.length > 0 && (
        <section id="projetos-restantes" className="py-16 sm:py-24">
          <ProjectGrid projects={remaining} />
        </section>
      )}
    </div>
  );
}
