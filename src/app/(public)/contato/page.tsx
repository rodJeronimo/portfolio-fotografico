import type { Metadata } from "next";

import { ContactForm } from "@/app/(public)/contato/contact-form";

export const metadata: Metadata = { title: "Contato" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contato</h1>
      <p className="text-muted mt-2 text-sm">
        Tem alguma pergunta ou proposta? Preencha o formulário abaixo.
      </p>
      <div className="mt-6">
        <ContactForm />
      </div>
    </main>
  );
}
