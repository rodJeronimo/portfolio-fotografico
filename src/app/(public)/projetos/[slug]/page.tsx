import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db/client";
import { project, photo, projectPhoto } from "@/db/schema";
import { PhotoGallery, type GalleryPhoto } from "@/components/gallery/photo-gallery";

// Fallback de segurança — invalidação real acontece via revalidatePath no upload/CRUD (ver admin/*/actions.ts).
export const revalidate = 3600;

async function getProject(slug: string) {
  return db.query.project.findFirst({ where: eq(project.slug, slug) });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const currentProject = await getProject(slug);
  if (!currentProject) return {};
  return { title: currentProject.title, description: currentProject.description ?? undefined };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const currentProject = await getProject(slug);
  if (!currentProject) notFound();

  const photos: GalleryPhoto[] = await db
    .select({
      id: photo.id,
      title: photo.title,
      storageKey: photo.storageKey,
      blurDataUrl: photo.blurDataUrl,
      width: photo.width,
      height: photo.height,
    })
    .from(projectPhoto)
    .innerJoin(photo, eq(projectPhoto.photoId, photo.id))
    .where(eq(projectPhoto.projectId, currentProject.id))
    .orderBy(asc(projectPhoto.displayOrder));

  return (
    <main>
      <nav aria-label="Breadcrumb" className="px-4 pt-6 sm:px-8">
        <ol className="text-muted flex gap-2 text-sm">
          <li>
            <Link href="/" className="hover:text-foreground underline">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {currentProject.title}
          </li>
        </ol>
      </nav>

      <div className="px-4 pt-4 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{currentProject.title}</h1>
        {currentProject.description && (
          <p className="text-muted mt-1 max-w-2xl text-sm">{currentProject.description}</p>
        )}
      </div>

      <PhotoGallery photos={photos} />
    </main>
  );
}
