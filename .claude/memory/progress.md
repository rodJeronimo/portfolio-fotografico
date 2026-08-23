# Memória — Progresso (snapshot)

Fonte completa e sempre atual: `docs/tasks/BOARD.md`. Este arquivo é um snapshot rápido, pode ficar levemente desatualizado — confira o board para o estado real.

## Concluído
- Fase 0–2, CI/CD, Vercel deploy validado em produção.
- **M0 (design tokens)**, **M1 (DB+Auth)** — ambos concluídos e validados de ponta a ponta em produção (login GitHub real confirmado pelo usuário).
- **M2 (admin upload) + M3 (pipeline de imagens, exceto DnD)** implementados juntos (fortemente acoplados): Server Actions de projeto/foto, presigned URL, validação MIME real, EXIF sanitizado, variantes WebP/AVIF + blur, rate limiting (mock). **Validado com smoke test real de integração** contra Neon+R2 reais (`npm run smoke:upload`) — não só testes unitários.

## Contas externas provisionadas
Neon ✅ · GitHub OAuth App ✅ · Cloudflare R2 ✅ (bucket `portfolio-fotografico`, credenciais validadas com list/put/delete real). Só falta **Upstash Redis** (rate limiting real — hoje é um mock em memória documentado, troca é isolada) e, mais adiante, **Resend/Formspider** (M5, formulário de contato).

## Padrão que se repetiu — útil saber de antemão
1. Nova env var real: (a) `.env.local`, (b) `PATCH /v9/projects/{id}/env/{envId}?teamId=...` na Vercel (token Team não funciona com `vercel env add`), (c) **redeploy manual** (`vercel deploy --prod`).
2. Toda página `/admin/**` que lê dados direto do DB sem `searchParams` precisa de `export const dynamic = "force-dynamic"` explícito — Next 15 tenta pré-renderizar estaticamente por padrão, o que serviria dado desatualizado numa área administrativa.
3. Testar lógica que depende de serviços reais (R2, Neon) via script `tsx` standalone (`scripts/smoke-test-upload-pipeline.ts`) quando não há como simular a UI (ex.: fluxo OAuth) — mais confiável que só unit tests com mocks.

## Concluído (cont.)
- **M4 (galeria pública)**: Home + página de projeto + lightbox acessível (`<dialog>` nativo, sem reimplementar focus trap). Conectado `revalidatePath` das rotas públicas nas Server Actions de M2 (gap real que existia — upload nunca atualizava a home/projeto antes disso). Validado com projeto+foto reais criados/testados/limpos via `tsx` + `curl` local.

## Concluído (cont. 2)
- **M5 (Sobre/Contato)**: `site_settings` CRUD (`about.content`), `/sobre` e `/contato` reais, formulário com honeypot + rate limit (reaproveita o mock do M2), envio de e-mail **mockado** (`src/lib/email/`) — decisão registrada: Resend (não Formspree) para quando a conta existir, troca isolada. Validado com upsert real no Neon + `curl`.

## Concluído (cont. 3)
- **M6 (SEO)**: sitemap dinâmico, robots.txt, JSON-LD ImageGallery, OG image dinâmica (default + por-projeto usando foto de capa real), `metadataBase`. Corrigido gap real de a11y/SEO: `PhotoGallery` podia renderizar `alt=""`. Validado com projeto+foto reais + `curl` (sitemap, robots, JSON-LD, PNG da OG image, og:image apontando pro R2).

## Próximo
- **TASK-0013**: reordenação drag-and-drop de fotos (extraída da TASK-0007, trabalho de UI substancial).
- **Revisão heurística de `@ux-designer`** pendente para M4 (não feita nesta sessão solo).
- **TASK-0011 (M7 — polish)**: sem bloqueio externo conhecido, pode seguir.
- Validação externa (Google Rich Results Test) do JSON-LD fica para quando o site estiver publicamente acessível — não testável offline.

## Backlog (ordem prevista)
TASK-0011 (M7 polish) → TASK-0013 (DnD) → TASK-0012 (M8 e2e/hardening, inclui trocar rate-limit mock por Upstash real e email mock por Resend real se as contas existirem até lá).
