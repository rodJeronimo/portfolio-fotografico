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
- [ ] Migrations aplicadas com sucesso em Neon (ambiente de dev). **Bloqueado**: conta Neon ainda não existe.
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
- **Validação local**: `npm run lint`/`type-check`/`test`/`build` verdes com env vars dummy em `.env.local` (gitignored). Smoke test do fluxo de redirect confirmado com `npm run dev`.
- **Bloqueado — requer ação do usuário**:
  1. Criar conta **Neon**, obter `DATABASE_URL`, rodar `npm run db:migrate` (aplica `drizzle/0000_low_khan.sql`).
  2. Criar **GitHub OAuth App** (`github.com/settings/developers` → New OAuth App; Homepage URL e Authorization callback URL `.../api/auth/callback/github`), obter `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`.
  3. Gerar `AUTH_SECRET` real (`npx auth secret` ou `openssl rand -base64 33`).
  4. Configurar as 3 nas env vars da Vercel (Production + Preview) e em `.env.local` local.
- Só depois disso os critérios de login real (allow/deny via GitHub) podem ser validados ponta a ponta — a lógica já está implementada e coberta por teste unitário, mas o fluxo OAuth completo depende dessas contas externas.
