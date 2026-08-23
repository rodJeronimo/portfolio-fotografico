"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { getPublicUrl } from "@/lib/storage/r2";

export interface GalleryPhoto {
  id: string;
  title: string | null;
  storageKey: string;
  blurDataUrl: string | null;
  width: number;
  height: number;
}

/**
 * Usa <dialog> nativo (showModal) para o lightbox: focus trap e ESC-to-close
 * já vêm do navegador de graça, sem reimplementar gerenciamento de foco.
 * Ver docs/design/guidelines.md (M4) e docs/tasks/backlog/TASK-0008-m4-galeria-publica.md.
 */
export function PhotoGallery({
  photos,
  projectTitle,
}: {
  photos: GalleryPhoto[];
  /** Usado como fallback de `alt` quando a foto não tem título próprio — nunca renderiza alt vazio. */
  projectTitle: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleClose() {
      setIndex(null);
      triggerRef.current?.focus();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  function open(photoIndex: number, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setIndex(photoIndex);
    dialogRef.current?.showModal();
  }

  function step(delta: number) {
    setIndex((current) => {
      if (current === null) return current;
      return (current + delta + photos.length) % photos.length;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDialogElement>) {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  }

  if (photos.length === 0) {
    return <p className="text-muted px-4 py-16 text-center text-sm sm:px-8">Nenhuma foto ainda.</p>;
  }

  const current = index !== null ? photos[index] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-8 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              className="bg-surface border-border relative block aspect-square w-full overflow-hidden rounded-md border"
              aria-label={p.title ? `Ver foto: ${p.title}` : "Ver foto ampliada"}
            >
              <Image
                src={getPublicUrl(`${p.storageKey}/thumb.webp`)}
                alt={p.title || `Foto de ${projectTitle}`}
                fill
                unoptimized
                {...(p.blurDataUrl
                  ? { placeholder: "blur" as const, blurDataURL: p.blurDataUrl }
                  : {})}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        aria-label="Visualização ampliada da foto"
        className="bg-surface m-auto max-h-[90vh] max-w-[90vw] rounded-md p-0"
      >
        {current && (
          <div className="relative flex max-h-[90vh] flex-col items-center gap-2 p-4">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fechar"
              className="border-border absolute top-2 right-2 rounded-md border px-2 py-1 text-sm"
            >
              Fechar
            </button>
            <div className="relative flex max-h-[75vh] w-full items-center justify-center">
              <Image
                key={current.id}
                src={getPublicUrl(`${current.storageKey}/medium.webp`)}
                alt={current.title || `Foto de ${projectTitle}`}
                width={current.width}
                height={current.height}
                unoptimized
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Foto anterior"
                  className="border-border rounded-md border px-3 py-1 text-sm"
                >
                  ‹ Anterior
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Próxima foto"
                  className="border-border rounded-md border px-3 py-1 text-sm"
                >
                  Próxima ›
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
