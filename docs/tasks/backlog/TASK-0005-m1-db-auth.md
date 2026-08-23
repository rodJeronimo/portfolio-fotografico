---
id: TASK-0005
title: "M1 — DB e Auth: schema Drizzle, migrations, NextAuth v5"
milestone: M1
owner: "@backend"
status: Bloqueada
depends_on: [TASK-0001]
related_docs: [docs/architecture/data-model.md, docs/architecture/auth-strategy.md, docs/ADR/0002-neon-postgres.md, docs/ADR/0004-nextauth-github-allowlist.md]
---

# TASK-0005 — M1: DB e Auth

## Contexto
Fundação de dados e autenticação: schema Drizzle definitivo, migrations contra Neon, NextAuth v5 com GitHub e allowlist, middleware protegendo `/admin/*`.

## Escopo
`db/schema.ts` a partir do draft em `drizzle/schema.ts`, migrations via `drizzle-kit generate`/`migrate`, config Auth.js v5 (`lib/auth/`), callback `signIn` com `ADMIN_EMAILS`, `middleware.ts`.

## Critérios de aceite
- [x] Migrations aplicadas com sucesso em Neon (ambiente de dev). Conta criada pelo usuário, `npm run db:migrate` rodado contra o banco real — 4 tabelas confirmadas (`photo`, `project`, `project_photo`, `site_settings`).
- [ ] Given um e-mail fora de `ADMIN_EMAILS`, When tenta logar via GitHub, Then o login é rejeitado. **Bloqueado para teste real**: GitHub OAuth App ainda não existe (lógica implementada e testada unitariamente).
- [ ] Given um e-mail em `ADMIN_EMAILS`, When loga via GitHub, Then acessa `/admin` com sessão JWT válida. **Idem acima.**
- [x] Given usuário sem sessão, When acessa `/admin/*`, Then é redirecionado para `/admin/login`. Validado via smoke test local (`/admin` → 307 → `/admin/login` → 200).
- [x] Testes unitários (`@qa`) cobrindo o callback de allowlist — 8/8 passando (`src/lib/auth/allowlist.test.ts`).

## Dependências
TASK-0001. Requer credenciais Neon e GitHub OAuth App configuradas (`@devops`/usuário).

## Resultado

- **Schema**: `src/db/schema.ts` já era a fonte de verdade (movido do draft na TASK-0002). Migration inicial gerada: `drizzle/0000_low_khan.sql` (4 tabelas, FKs, índices — confere com `docs/architecture/data-model.md`).
- **Auth.js v5**: `src/lib/auth/index.ts` (provider GitHub, sessão JWT, callback `signIn` valida allowlist), `src/lib/auth/allowlist.ts` (lógica pura testável — `parseAllowlist`/`isAllowedEmail`, case-insensitive), Route Handler `src/app/api/auth/[...nextauth]/route.ts`.
- **Middleware real**: `src/middleware.ts` agora usa `auth()` do Auth.js (substitui o placeholder da TASK-0004) — redireciona para `/admin/login` quando não autenticado.
- **Rotas mínimas**: `src/app/admin/login/page.tsx` (botão "Entrar com GitHub" via Server Action `signIn`) e `src/app/admin/page.tsx` (placeholder pós-login) — UI completa é escopo de M2 (TASK-0006), aqui só o necessário para o middleware ter destino real.
- **Testes**: `src/lib/auth/allowlist.test.ts`, 8 casos (case-insensitivo, CSV vazio, entradas vazias, null/undefined, allowlist vazia).
- **Neon provisionado**: conta criada pelo usuário, `DATABASE_URL` real obtida, migration aplicada com sucesso (`npm run db:migrate`), 4 tabelas confirmadas via query direta. `DATABASE_URL` atualizada também no projeto Vercel (Preview+Production, substituindo o placeholder da TASK-0003).
- **Bug real encontrado e corrigido**: `drizzle-kit` (CLI standalone) não carrega `.env.local` automaticamente — isso é comportamento do `next dev`/`next build`, não do Node puro. Scripts `db:generate`/`db:migrate`/`db:push`/`db:studio` ajustados para `node --env-file=.env.local ./node_modules/drizzle-kit/bin.cjs ...`.
- **Validação local**: `npm run lint`/`type-check`/`test`/`build` verdes. Smoke test do fluxo de redirect confirmado com `npm run dev`. Migration real aplicada e verificada contra o Neon.
- **Ainda bloqueado — requer ação do usuário**:
  1. Criar **GitHub OAuth App** (`github.com/settings/developers` → New OAuth App; Authorization callback URL `.../api/auth/callback/github`), obter `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`.
  2. Gerar `AUTH_SECRET` real (`npx auth secret` ou `openssl rand -base64 33`).
  3. Atualizar as 2 nas env vars da Vercel (substituindo os placeholders) e em `.env.local` local.
- Só depois disso os critérios de login real (allow/deny via GitHub) podem ser validados ponta a ponta.
