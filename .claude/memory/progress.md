# Memória — Progresso (snapshot)

Fonte completa e sempre atual: `docs/tasks/BOARD.md`. Este arquivo é um snapshot rápido.

## 🚀 v1.1.0 lançado em produção (2026-08-23)
Feature: dashboard admin pós-login (ADR-0006) — nav persistente + hub por cards, rota de fotos migrada para `/admin/projects/[projectId]/fotos`. Fluxo completo `@arquiteto`→`@ux-designer`(mockup aprovado pelo usuário)→`@pm`(TASK-0014/0015)→`@backend`/`@frontend`→`@reviewer`/`@qa`. Release via GitFlow (`release/1.1.0` → PR #22 → `main`, admin-bypass), tag `v1.1.0`.

**Incidente de processo**: TASK-0014 e TASK-0015 rodaram em paralelo (2 agentes) no mesmo working directory compartilhado, colidindo com uma sessão interativa também ativa no projeto — causou `git stash` acidental do trabalho de um agente e um commit duplicado no branch do outro. Recuperado sem perda (cherry-pick + rebase), mas custou tempo. **Licao**: para trabalho paralelo com múltiplos agentes Bash-capable no mesmo repo, isolar em worktrees separadas.

**Débito de GitFlow descoberto**: o job `sync-develop` (`release.yml`) consegue empurrar a branch de sync mas falha silenciosamente ao abrir o PR (permissão do `GITHUB_TOKEN` do Actions) — em **todo** release até agora precisou de intervenção manual (`gh pr create` na branch que o job já empurrou) para trazer `main` de volta pra `develop`. Verificar sempre após um release se `develop` ficou de fato sincronizada (`git diff origin/develop origin/main`), não confiar que o job resolveu sozinho.

## v1.0.0 lançado em produção (2026-08-23)
Release formal via GitFlow (`release/1.0.0` → PR #18 → `main`, merge admin-bypass pois autor não pode auto-aprovar), tag `v1.0.0`, deploy real `vercel deploy --prod`. URL: `https://portfolio-fotografico-eta.vercel.app`. GitHub Release: https://github.com/rodJeronimo/portfolio-fotografico/releases/tag/v1.0.0.

## 🎉 Roadmap original completo (M0–M8)
Todas as 9 milestones do plano original (Fase 0 a M8) estão **Concluídas**. Portfólio funcionalmente completo, validado com dados reais em produção (Neon+R2+Vercel+GitHub OAuth), com suite e2e real (Playwright, 6/6 passando) e revisão OWASP sem itens críticos abertos.

## Contas externas provisionadas
Neon ✅ · GitHub OAuth App ✅ · Cloudflare R2 ✅ (bucket `portfolio-fotografico`, CORS configurado). Pendentes (com mock funcional, não bloqueiam): **Upstash Redis** (rate limiting — mock em memória) e **Resend** (e-mail de contato — mock `console.log`). Trocas são isoladas quando as contas existirem.

## Bugs reais encontrados e corrigidos ao longo do projeto (útil para não repetir)
1. Token Vercel de conta Team quebra `pull`/`build --prebuilt`/`whoami` — usar sempre `vercel deploy` puro (build remoto).
2. `GITHUB_TOKEN` do job de CI precisa de `permissions: pull-requests: write` para comentar em PR.
3. `drizzle-kit` standalone não carrega `.env.local` — usar `node --env-file=.env.local`.
4. CI/build estático precisa de `DATABASE_URL` **real** (`secrets.CI_DATABASE_URL`) — páginas públicas executam queries reais durante `next build`.
5. `PhotoGallery` podia renderizar `alt=""` — sempre ter fallback textual gerado.
6. **`notFound()` em rota dinâmica dentro de route group `(nome)` retorna HTTP 200** — bug real do Next 15.5.23, isolado com 8 repros mínimas, não corrigido (impacto SEO-only). Ver `docs/architecture/known-issues.md`.
7. **CORS ausente no bucket R2** — upload direto do navegador pro R2 bloqueado silenciosamente; só um teste e2e real via Chromium pega isso (scripts Node não sofrem CORS). Corrigido via painel Cloudflare.
8. **Vazamento potencial de secrets pro bundle client** — `getPublicUrl()` vivia no mesmo módulo que o `S3Client` (credenciais R2); isolado em módulo próprio client-safe. `STORAGE_R2_PUBLIC_URL` recategorizada como `NEXT_PUBLIC_*` (nunca foi segredo).
9. `next start` local exige `AUTH_TRUST_HOST=true` (Vercel real já confia via proxy próprio).
10. Testes e2e que seedam direto no DB (bypassando Server Actions) não disparam `revalidatePath` — endpoint interno `POST /api/revalidate` resolve (padrão webhook de CMS).
11. Testes e2e que mutam estado real compartilhado (Neon+R2) **precisam rodar serial** (`workers: 1`) — paralelismo causa `beforeAll` duplicado e dados colidindo.
12. `e2e.yml` (PRs para `main`) nunca tinha sido exercitado de fato (só localmente na TASK-0012) — 3 bugs reais só apareceram no primeiro release: (a) `wait-for-vercel-preview` espera Deployment status do app `vercel[bot]`, que não existe com token Team-scoped (`vercel deploy` via CLI não passa pela integração GitHub App) — resolvido fazendo o próprio job deployar o preview; (b) `playwright.config.ts` sempre subia servidor local mesmo testando contra preview remoto — `webServer` agora é condicional a `PLAYWRIGHT_BASE_URL`; (c) helpers de teste (Neon+R2 diretos) não tinham os secrets reais no GitHub Actions — só existiam localmente.
13. **Vercel Deployment Protection ("Vercel Authentication") ativo bloqueava e2e contra preview** — redirect pra `vercel.com/login` em toda página, 401 em toda API. Resolvido desativando o toggle em Project Settings (usuário, via dashboard).
14. Bypass de OAuth em e2e (`tests/e2e/helpers/auth.ts`) fixava `domain: "localhost"` e cookie sem prefixo — contra HTTPS real o Auth.js exige `__Secure-authjs.session-token` (também usado como salt do JWE) e cookie escopado à URL real, não a "localhost".

## Padrão geral (env vars)
Nova env var real: (a) `.env.local`, (b) `PATCH /v9/projects/{id}/env/{envId}?teamId=...` na Vercel, (c) **redeploy manual** (`vercel deploy --prod`).

## Pendências não-bloqueantes conhecidas
- Revisão heurística formal de `@ux-designer` (M4/M7) — sessão solo, sem esse papel ativo.
- Validação externa do JSON-LD (Google Rich Results Test) — precisa do site publicamente acessível.
- Bug do `known-issues.md` (notFound 200) — sem fix aplicado, mitigação sugerida documentada.
- Trocar mocks (rate-limit → Upstash, email → Resend) quando/se as contas existirem.

## Próximo (fora do roadmap original)
Nada planejado — v1.1.0 em produção. Débitos não-bloqueantes da última feature: teste unitário para `isActive()` (admin-nav.tsx), inconsistência visual pequena do indicador de item ativo mobile vs desktop. Próximos passos ficam a critério do usuário.
