"use client";

import { useState, useTransition } from "react";

import { updateSiteSetting } from "@/app/admin/settings/actions";

export function SettingsForm({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const result = await updateSiteSetting({ key: "about.content", value: content, locale: "pt-BR" });
      if (!result.success) {
        setError(result.error ?? "Erro ao salvar.");
        return;
      }
      setStatus("Salvo com sucesso.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="about-content" className="text-sm font-medium">
        Sobre Mim
      </label>
      <textarea
        id="about-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="border-border rounded-md border px-3 py-2 text-sm"
      />
      {error && <p className="text-danger text-sm">{error}</p>}
      {status && <p className="text-sm text-green-700">{status}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-accent-foreground self-start rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
