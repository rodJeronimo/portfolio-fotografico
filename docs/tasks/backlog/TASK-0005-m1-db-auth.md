---
id: TASK-0005
title: "M1 — DB e Auth: schema Drizzle, migrations, NextAuth v5"
milestone: M1
owner: "@backend"
status: Backlog
depends_on: [TASK-0001]
related_docs: [docs/architecture/data-model.md, docs/architecture/auth-strategy.md, docs/ADR/0002-neon-postgres.md, docs/ADR/0004-nextauth-github-allowlist.md]
---

# TASK-0005 — M1: DB e Auth

## Contexto
Fundação de dados e autenticação: schema Drizzle definitivo, migrations contra Neon, NextAuth v5 com GitHub e allowlist, middleware protegendo `/admin/*`.

## Escopo
`db/schema.ts` a partir do draft em `drizzle/schema.ts`, migrations via `drizzle-kit generate`/`migrate`, config Auth.js v5 (`lib/auth/`), callback `signIn` com `ADMIN_EMAILS`, `middleware.ts`.

## Critérios de aceite
- [ ] Migrations aplicadas com sucesso em Neon (ambiente de dev).
- [ ] Given um e-mail fora de `ADMIN_EMAILS`, When tenta logar via GitHub, Then o login é rejeitado.
- [ ] Given um e-mail em `ADMIN_EMAILS`, When loga via GitHub, Then acessa `/admin` com sessão JWT válida.
- [ ] Given usuário sem sessão, When acessa `/admin/*`, Then é redirecionado para `/admin/login`.
- [ ] Testes unitários (`@qa`) cobrindo o callback de allowlist.

## Dependências
TASK-0001. Requer credenciais Neon e GitHub OAuth App configuradas (`@devops`).

## Resultado
*(a preencher)*
