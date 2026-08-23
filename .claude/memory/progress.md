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

## Próximo
- **TASK-0008 (M4 — Galeria pública)**: liberada (`Pronta`), sem bloqueio externo conhecido. Fazer sentido implementar `next/image` loader customizado para R2 aqui (adiado da TASK-0007 por não ter consumidor até agora).
- **TASK-0013**: reordenação drag-and-drop de fotos (extraída da TASK-0007, é trabalho de UI substancial).
- **TASK-0009 (M5)**: vai precisar de conta Resend ou Formspree.

## Backlog (ordem prevista)
TASK-0008 (M4 galeria pública) → TASK-0013 (DnD, pode ser paralelo) → TASK-0009 (M5, precisa Resend/Formspree) → TASK-0010 (M6 SEO) → TASK-0011 (M7 polish) → TASK-0012 (M8 e2e/hardening, inclui trocar rate-limit mock por Upstash real se a conta existir até lá).
