import { eq, asc } from "drizzle-orm";

import { db } from "@/db/client";
import { photo, project, projectPhoto } from "@/db/schema";
import { UploadForm } from "@/app/admin/fotos/upload-form";
import { PhotoReorderList } from "@/app/admin/fotos/photo-reorder-list";

export const dynamic = "force-dynamic";

export default async function AdminFotosPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;

  if (!projectId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-muted text-sm">
          Selecione um projeto em <code>/admin/projects</code> para gerenciar suas fotos.
        </p>
      </main>
    );
  }

  const currentProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  const photos = await db
    .select({
      id: photo.id,
      storageKey: photo.storageKey,
      title: photo.title,
    })
    .from(projectPhoto)
    .innerJoin(photo, eq(projectPhoto.photoId, photo.id))
    .where(eq(projectPhoto.projectId, projectId))
    .orderBy(asc(projectPhoto.displayOrder));

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Fotos — {currentProject?.title ?? "Projeto não encontrado"}
      </h1>

      <UploadForm projectId={projectId} />

      <PhotoReorderList projectId={projectId} initialPhotos={photos} />
    </main>
  );
}
