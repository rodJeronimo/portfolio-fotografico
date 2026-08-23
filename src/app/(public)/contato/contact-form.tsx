"use client";

import { useState, useTransition } from "react";

import { submitContactForm } from "@/app/(public)/contato/actions";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitContactForm({ name, email, message, company });
      if (!result.success) {
        setError(result.error ?? "Erro ao enviar mensagem.");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    });
  }

  if (status === "sent") {
    return (
      <p role="status" className="text-sm">
        Mensagem enviada com sucesso. Obrigado pelo contato!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot — invisível para humanos, bots costumam preencher qualquer campo. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="company">Empresa</label>
        <input
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-border rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-border rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium">
          Mensagem
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-border rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-accent-foreground self-start rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
