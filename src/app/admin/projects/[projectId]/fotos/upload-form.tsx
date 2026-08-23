"use client";

import { useRef, useState, useTransition } from "react";

import { requestPhotoUpload, confirmPhotoUpload } from "@/app/admin/projects/[projectId]/fotos/actions";

export function UploadForm({ projectId }: { projectId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    startTransition(async () => {
      setStatus("Solicitando upload...");
      const requested = await requestPhotoUpload({
        projectId,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size,
      });
      if (!requested.success || !requested.data) {
        setError(requested.error ?? "Erro ao iniciar upload.");
        setStatus(null);
        return;
      }

      setStatus("Enviando arquivo...");
      const putResponse = await fetch(requested.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putResponse.ok) {
        setError("Falha ao enviar o arquivo para o storage.");
        setStatus(null);
        return;
      }

      setStatus("Processando imagem...");
      const confirmed = await confirmPhotoUpload({
        projectId,
        storageKey: requested.data.storageKey,
      });
      if (!confirmed.success) {
        setError(confirmed.error ?? "Erro ao processar a foto.");
        setStatus(null);
        return;
      }

      setStatus("Foto enviada com sucesso.");
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="border-border flex flex-col gap-2 rounded-md border border-dashed p-6">
      <label htmlFor="photo-input" className="text-sm font-medium">
        Upload de foto (JPEG, PNG, WebP ou AVIF, até 25MB)
      </label>
      <input
        ref={inputRef}
        id="photo-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm"
      />
      {status && <p className="text-muted text-sm">{status}</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}
