---
id: TASK-0009
title: "M5 — Sobre Mim e Contato (conteúdo editável + formulário)"
milestone: M5
owner: "@backend"
status: Concluida
depends_on: [TASK-0006]
related_docs: [docs/architecture/data-model.md]
---

# TASK-0009 — M5: Sobre Mim e Contato

## Contexto
Páginas institucionais com conteúdo editável via admin (`site_settings`) e formulário de contato funcional.

## Escopo
CRUD de `site_settings` no admin (`@backend`), páginas públicas Sobre/Contato (`@frontend`), Server Action de envio de contato integrada a Resend ou Formspree (decisão de implementação de `@backend`, documentar escolha).

## Critérios de aceite
- [x] Given admin edita o texto de "Sobre Mim", When salva, Then a página pública reflete a mudança após revalidação (<60s). Validado via upsert real no Neon + `curl` em `/sobre` (conteúdo apareceu corretamente).
- [x] Given visitante preenche o formulário de contato com dados válidos, When envia, Then recebe confirmação de sucesso e o e-mail é entregue ao fotógrafo. **Envio de e-mail mockado** (ver decisão abaixo) — confirmação de sucesso funciona, entrega real depende de conta Resend/Formspree.
- [x] Given envio com dados inválidos, When submetido, Then validação zod bloqueia com mensagens claras. 5 testes unitários (`contact.test.ts`).
- [x] Formulário protegido contra spam básico (honeypot ou rate limit). **Ambos**: honeypot (campo `company` invisível, `max(0)`) + rate limit (reaproveita `checkRateLimit` do M2, chaveado por IP via `x-forwarded-for`).

## Dependências
TASK-0006 (admin base precisa existir).

## Resultado

- **`site_settings`**: `src/app/admin/settings/actions.ts` (`updateSiteSetting`, upsert via `onConflictDoUpdate` na PK composta `key+locale`), `src/app/admin/settings/page.tsx` + `settings-form.tsx` (textarea simples). Único key usado por ora: `about.content`.
- **`/sobre`**: lê `site_settings` diretamente (Server Component), empty state ("Conteúdo em breve") quando não configurado.
- **`/contato`**: `src/app/(public)/contato/contact-form.tsx` (client, honeypot + validação) + `actions.ts` (`submitContactForm` — valida honeypot antes de gastar rate limit, depois valida rate limit, depois "envia").
- **Decisão de envio de e-mail**: **Resend** escolhido (não Formspree) — SDK simples, integração natural com Server Actions sem exigir endpoint externo/formulário HTML tradicional. **Implementação é um mock** (`src/lib/email/index.ts`, `sendContactEmail`) até a conta existir — assinatura já desenhada para a troca por `resend` SDK não exigir mudança nos callers.
- **`SiteHeader`** atualizado com nav real para `/sobre` e `/contato` (antes só tinha o wordmark, porque essas rotas não existiam).
- **Testes unitários**: `src/lib/validations/contact.test.ts` (5 casos, incluindo honeypot preenchido vs vazio) — total do repo agora 26 testes.
- **Validação real**: `about.content` inserido de verdade no Neon (texto de exemplo), `/sobre` confirmado renderizando via `curl` (200, conteúdo presente), `/contato` renderiza (200), nav da home linka corretamente para ambas. **Texto de exemplo removido** após o teste (não é a biografia real do usuário — fica para ele preencher via `/admin/settings`).
- **Pendência**: conta Resend (ou Formspree) para envio real de e-mail — troca isolada em `src/lib/email/index.ts` quando existir.
