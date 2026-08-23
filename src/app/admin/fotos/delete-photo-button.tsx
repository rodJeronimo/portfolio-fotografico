"use client";

import { useTransition } from "react";

import { deletePhoto } from "@/app/admin/fotos/actions";

export function DeletePhotoButton({ photoId }: { photoId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Excluir esta foto? Essa ação não pode ser desfeita.")) return;
        startTransition(async () => {
          await deletePhoto(photoId);
        });
      }}
      className="text-danger text-xs underline disabled:opacity-50"
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
