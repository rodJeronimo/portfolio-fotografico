import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db/client";
import { project, photo, projectPhoto } from "@/db/schema";
import { env } from "@/lib/env";
import { getPublicUrl } from "@/lib/storage/public-url";
import { PhotoGallery, type GalleryPhoto } from "@/components/gallery/photo-gallery";

// Fallback de segurança — invalidação real acontece via revalidatePath no upload/CRUD (ver admin/*/actions.ts).
export const revalidate = 3600;

async function getProject(slug: string) {
  return db.query.project.findFirst({ where: eq(project.slug, slug) });
}

async function getPhotos(projectId: string): Promise<GalleryPhoto[]> {
  return db
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
    .where(eq(projectPhoto.projectId, projectId))
    .orderBy(asc(projectPhoto.displayOrder));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const currentProject = await getProject(slug);
  if (!currentProject) return {};

  const photos = await getPhotos(currentProject.id);
  const cover = photos[0];

  return {
    title: currentProject.title,
    description: currentProject.description ?? undefined,
    openGraph: {
      title: currentProject.title,
      description: currentProject.description ?? undefined,
      ...(cover
        ? { images: [{ url: getPublicUrl(`${cover.storageKey}/medium.webp`) }] }
        : {}),
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const currentProject = await getProject(slug);
  if (!currentProject) notFound();

  const photos = await getPhotos(currentProject.id);

  const pageUrl = `${env.NEXT_PUBLIC_SITE_URL}/projetos/${currentProject.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: currentProject.title,
    description: currentProject.description ?? undefined,
    url: pageUrl,
    associatedMedia: photos.map((p) => ({
      "@type": "ImageObject",
      contentUrl: getPublicUrl(`${p.storageKey}/medium.webp`),
      thumbnailUrl: getPublicUrl(`${p.storageKey}/thumb.webp`),
      name: p.title || `Foto de ${currentProject.title}`,
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

      <PhotoGallery photos={photos} projectTitle={currentProject.title} />
    </main>
  );
}
