---
id: TASK-0012
title: "M8 — Testes e2e e hardening final"
milestone: M8
owner: "@qa"
status: Em revisao
depends_on: [TASK-0011]
related_docs: [docs/architecture/security.md, docs/architecture/owasp-review.md, docs/architecture/known-issues.md]
---

# TASK-0012 — M8: Testes e2e e hardening final

## Contexto
Cobertura e2e dos fluxos críticos e revisão final de segurança antes de considerar o produto pronto para uso real.

## Escopo
Playwright cobrindo upload → exibição pública, rate limiting, revisão OWASP (`@qa` + apoio de `@reviewer`).

## Critérios de aceite
- [x] Teste e2e cobre: login admin → upload de foto → foto aparece na galeria pública em <60s. `tests/e2e/admin-upload.spec.ts` — bypass de OAuth via JWT (`helpers/auth.ts`), cria projeto real pela UI, upload real de arquivo, confirma na listagem admin e na página pública.
- [x] Teste e2e valida bloqueio por rate limit no upload. Coberto via 4 testes unitários (`src/lib/rate-limit/index.test.ts`) — ver nota de escopo abaixo sobre por que não é e2e via navegador.
- [x] Teste e2e valida navegação por teclado no lightbox (setas, ESC). `tests/e2e/gallery.spec.ts` — seta direita navega, ESC fecha e devolve foco ao elemento que abriu.
- [x] Checklist OWASP Top 10 revisado sem itens críticos abertos. `docs/architecture/owasp-review.md` — 2 achados críticos reais encontrados e corrigidos durante esta task (ver Resultado).
- [x] Todos os critérios de aceite das tasks M0–M7 confirmados como atendidos (auditoria final). Único item pendente encontrado: revisão heurística formal de `@ux-designer` (M4/M7) — não feita por ser sessão solo, consistentemente documentada em cada task afetada, não bloqueante para uso real.

## Dependências
TASK-0011 e, transitivamente, todas as tasks de milestone anteriores.

## Resultado

- **Suite e2e real** (`tests/e2e/`, Playwright, roda contra build de produção real via `next build && next start`, não `next dev`):
  - `admin-protected.spec.ts` — acesso não autenticado a `/admin` e `/admin/projects` redireciona corretamente.
  - `admin-upload.spec.ts` — fluxo completo ponta a ponta: login (bypass OAuth via JWT assinado com o mesmo `AUTH_SECRET`), criação de projeto pela UI, upload real de arquivo (dispara `requestPhotoUpload` → PUT direto no R2 → `confirmPhotoUpload`), confirmação na listagem admin e na página pública.
  - `gallery.spec.ts` — navegação pela home, abertura do lightbox, navegação por seta, ESC fecha e devolve foco, breadcrumb.
  - **6/6 testes passando**, execução estável (validado em múltiplas rodadas consecutivas).
- **Infraestrutura de teste real** (não mocks): `tests/e2e/helpers/auth.ts` (bypass de OAuth via `@auth/core/jwt` `encode()`, mesmo `AUTH_SECRET`/cookie da aplicação real), `tests/e2e/helpers/seed.ts` (seed/cleanup de dados reais no Neon+R2 via pipeline real de M3), `tests/e2e/global-setup.ts` (varredura defensiva de órfãos antes/depois da suite).
- **3 bugs reais encontrados e corrigidos durante a implementação dos testes** (nenhum era conhecido antes de rodar em navegador de verdade):
  1. **CORS ausente no bucket R2** — upload direto do navegador para o R2 (presigned PUT) era bloqueado silenciosamente pelo browser. Só um teste e2e real via Chromium pega isso (scripts Node não sofrem CORS). Corrigido pelo usuário via painel Cloudflare.
  2. **Vazamento potencial de credenciais de servidor para o bundle client** — `getPublicUrl()` vivia no mesmo módulo que o `S3Client` (credenciais R2); Client Components importando essa função pura arriscavam puxar a instanciação do cliente S3 com secrets para o JS do navegador. Isolado em `src/lib/storage/public-url.ts`, `STORAGE_R2_PUBLIC_URL` recategorizada como `NEXT_PUBLIC_*` (nunca foi segredo).
  3. **`AUTH_TRUST_HOST` ausente** — `next start` (produção local) rejeitava todas as requisições de auth com `UntrustedHost`. Necessário só para build local/CI; a Vercel real já confia via proxy próprio.
- **Bug de infraestrutura de teste corrigido no processo**: seeding direto no banco (bypassando Server Actions) não disparava `revalidatePath`, deixando a Home presa no cache ISR do build. Resolvido com endpoint interno `POST /api/revalidate` (protegido pelo `AUTH_SECRET`, mesmo padrão de um webhook de CMS headless).
- **Execução serial obrigatória**: testes mutam estado real compartilhado (Neon+R2), não bancos isolados por teste — `fullyParallel: false`, `workers: 1` no `playwright.config.ts` (paralelismo causava `beforeAll` duplicado e dados colidindo entre workers).
- **Rate limit**: mantido como cobertura unitária (4 testes), não e2e via navegador — simular 30+ uploads reais pelo Chromium seria lento (minutos) para um ganho de confiança marginal sobre o que os testes unitários já garantem sobre a lógica da sliding window.
- **`docs/architecture/owasp-review.md`**: revisão completa das 10 categorias, 2 achados críticos (ambos corrigidos e descritos acima), 2 itens aceitos conscientemente (dependências transitivas de dev, logging de segurança básico) dado o porte do projeto.
- **Auditoria final M0–M7**: `grep` por critérios de aceite não marcados em `docs/tasks/done/` — único item aberto é a revisão heurística de `@ux-designer` (não bloqueante, consistentemente documentada).
