"use client";

import { useState, useTransition } from "react";

import { createProject } from "@/app/admin/projects/actions";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProjectForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug((current) => (current === slugify(title) || current === "" ? slugify(value) : current));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createProject({
        title,
        slug,
        description: description || undefined,
      });
      if (!result.success) {
        setError(result.error ?? "Erro ao criar projeto.");
        return;
      }
      setTitle("");
      setSlug("");
      setDescription("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border-border flex flex-col gap-3 rounded-md border p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="border-border rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          required
          className="border-border rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border-border rounded-md border px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-accent-foreground self-start rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Criando..." : "Criar projeto"}
      </button>
    </form>
  );
}
