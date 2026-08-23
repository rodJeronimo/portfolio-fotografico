"use client";

import { useState, useTransition } from "react";

import { updatePhotoOrder, deletePhoto } from "@/app/admin/projects/[projectId]/fotos/actions";
import { getPublicUrl } from "@/lib/storage/public-url";

export interface ReorderablePhoto {
  id: string;
  title: string | null;
  storageKey: string;
}

/**
 * Reordenação (TASK-0013): drag-and-drop nativo (mouse/touch) + botões
 * "mover para cima/baixo" como alternativa acessível via teclado — DnD puro
 * raramente é operável por teclado sem uma biblioteca dedicada, então em
 * vez de reimplementar isso optamos por um controle explícito equivalente.
 */
export function PhotoReorderList({
  projectId,
  initialPhotos,
}: {
  projectId: string;
  initialPhotos: ReorderablePhoto[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  function persist(next: ReorderablePhoto[]) {
    setPhotos(next);
    startTransition(() => {
      updatePhotoOrder(
        projectId,
        next.map((p) => p.id),
      );
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    persist(next);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...photos];
    const [moved] = next.splice(dragIndex, 1);
    if (!moved) {
      setDragIndex(null);
      return;
    }
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    persist(next);
  }

  if (photos.length === 0) {
    return <p className="text-muted text-sm">Nenhuma foto ainda.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {photos.map((p, i) => (
        <li
          key={p.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
          className="border-border flex flex-col gap-2 rounded-md border p-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail simples, next/image entra em M4 (galeria) */}
          <img
            src={getPublicUrl(`${p.storageKey}/thumb.webp`)}
            alt={p.title ?? ""}
            className="aspect-square w-full cursor-grab rounded object-cover"
          />
          <div className="flex items-center justify-between gap-1">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Mover para cima"
                className="border-border rounded-md border px-2 py-1 text-xs disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === photos.length - 1}
                aria-label="Mover para baixo"
                className="border-border rounded-md border px-2 py-1 text-xs disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!confirm("Excluir esta foto? Essa ação não pode ser desfeita.")) return;
                setPhotos((current) => current.filter((photo) => photo.id !== p.id));
                deletePhoto(p.id);
              }}
              className="text-danger text-xs underline"
            >
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
