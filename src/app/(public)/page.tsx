import { eq, asc } from "drizzle-orm";

import { db } from "@/db/client";
import { photo, projectPhoto } from "@/db/schema";
import { ProjectGrid, type ProjectGridItem } from "@/components/gallery/project-grid";

// Fallback de segurança — invalidação real acontece via revalidatePath no upload/CRUD (ver actions.ts).
export const revalidate = 3600;

export default async function HomePage() {
  const projects = await db.query.project.findMany({
    orderBy: (p, { asc: ascOrder }) => [ascOrder(p.displayOrder), ascOrder(p.createdAt)],
  });

  const items: ProjectGridItem[] = await Promise.all(
    projects.map(async (p) => {
      const coverId = p.coverPhotoId;
      const coverPhoto = coverId
        ? await db.query.photo.findFirst({ where: eq(photo.id, coverId) })
        : (
            await db
              .select({
                storageKey: photo.storageKey,
                blurDataUrl: photo.blurDataUrl,
                width: photo.width,
                height: photo.height,
              })
              .from(projectPhoto)
              .innerJoin(photo, eq(projectPhoto.photoId, photo.id))
              .where(eq(projectPhoto.projectId, p.id))
              .orderBy(asc(projectPhoto.displayOrder))
              .limit(1)
          )[0];

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        cover: coverPhoto
          ? {
              storageKey: coverPhoto.storageKey,
              blurDataUrl: coverPhoto.blurDataUrl,
              width: coverPhoto.width,
              height: coverPhoto.height,
            }
          : null,
      };
    }),
  );

  return (
    <main>
      <div className="px-4 py-16 text-center sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Portfólio Fotográfico</h1>
        <p className="text-muted mx-auto mt-2 max-w-md text-base">
          Fotografia de natureza — paisagens, macro, vida selvagem e long exposure.
        </p>
      </div>
      <ProjectGrid projects={items} />
    </main>
  );
}
