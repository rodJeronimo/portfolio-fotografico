---
id: TASK-0001
title: Setup do projeto Next.js, GitFlow e repositório GitHub
milestone: Fase2
owner: "@devops"
status: Backlog
depends_on: []
related_docs: [docs/architecture/folder-structure.md, docs/ADR/0001-nextjs-app-router.md, docs/ADR/0005-gitflow.md]
---

# TASK-0001 — Setup do projeto Next.js, GitFlow e repositório GitHub

## Contexto
Fase 2 do plano: inicializar o projeto Next.js 15 conforme decidido nos ADRs 0001/0005, estabelecer GitFlow e publicar o repositório no GitHub antes de qualquer código de feature.

## Escopo
`create-next-app` (TS, Tailwind v4, ESLint, App Router, src dir, `@/*`), `.gitignore`/`.editorconfig`/`.nvmrc`/README/LICENSE, scripts de `package.json`, ESLint+Prettier+TS strict, dependências base (`next-auth@beta`, `drizzle-orm`, `drizzle-kit`, driver Neon, `sharp`, `zod`, `@t3-oss/env-nextjs`), init git, branches `main`/`develop`, `gh repo create`, push, `CODEOWNERS`, branch protection via `gh api`, fluxo GitFlow documentado no README.

## Critérios de aceite
- [ ] `npm run dev` sobe a aplicação sem erros.
- [ ] `npm run lint` e `npm run type-check` passam.
- [ ] Branches `main` e `develop` existem local e remotamente; `main` protegida (PR + 1 review + CI verde, sem push direto).
- [ ] `CODEOWNERS` mapeia pastas para agentes conforme `.claude/agents/devops.md`.
- [ ] README documenta o fluxo GitFlow (quando abrir PR para develop/main/hotfix).

## Dependências
Nenhuma — primeira task de implementação do projeto.

## Resultado
*(a preencher)*
