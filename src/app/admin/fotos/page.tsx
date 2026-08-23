import { eq, asc } from "drizzle-orm";

import { db } from "@/db/client";
import { photo, project, projectPhoto } from "@/db/schema";
import { getPublicUrl } from "@/lib/storage/r2";
import { UploadForm } from "@/app/admin/fotos/upload-form";
import { DeletePhotoButton } from "@/app/admin/fotos/delete-photo-button";

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
      blurDataUrl: photo.blurDataUrl,
      displayOrder: projectPhoto.displayOrder,
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

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.length === 0 && <li className="text-muted text-sm">Nenhuma foto ainda.</li>}
        {photos.map((p) => (
          <li key={p.id} className="border-border flex flex-col gap-2 rounded-md border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail simples, next/image entra em M4 (galeria) */}
            <img
              src={getPublicUrl(`${p.storageKey}/thumb.webp`)}
              alt={p.title ?? ""}
              className="aspect-square w-full rounded object-cover"
            />
            <DeletePhotoButton photoId={p.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
