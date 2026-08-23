---
id: TASK-0001
title: Setup do projeto Next.js, GitFlow e repositório GitHub
milestone: Fase2
owner: "@devops"
status: Concluida
depends_on: []
related_docs: [docs/architecture/folder-structure.md, docs/ADR/0001-nextjs-app-router.md, docs/ADR/0005-gitflow.md]
---

# TASK-0001 — Setup do projeto Next.js, GitFlow e repositório GitHub

## Contexto
Fase 2 do plano: inicializar o projeto Next.js 15 conforme decidido nos ADRs 0001/0005, estabelecer GitFlow e publicar o repositório no GitHub antes de qualquer código de feature.

## Escopo
`create-next-app` (TS, Tailwind v4, ESLint, App Router, src dir, `@/*`), `.gitignore`/`.editorconfig`/`.nvmrc`/README/LICENSE, scripts de `package.json`, ESLint+Prettier+TS strict, dependências base (`next-auth@beta`, `drizzle-orm`, `drizzle-kit`, driver Neon, `sharp`, `zod`, `@t3-oss/env-nextjs`), init git, branches `main`/`develop`, `gh repo create`, push, `CODEOWNERS`, branch protection via `gh api`, fluxo GitFlow documentado no README.

## Critérios de aceite
- [x] `npm run dev` sobe a aplicação sem erros (smoke test: `HTTP 200` em `http://localhost:3000`).
- [x] `npm run lint` e `npm run type-check` passam sem erros.
- [x] Branches `main` e `develop` existem local e remotamente; `main` protegida (PR + 1 review, sem push/force-push/delete direto).
- [x] `CODEOWNERS` mapeia pastas para agentes conforme `.claude/agents/devops.md` (em `.github/CODEOWNERS`, apontando para o mantenedor real `@rodJeronimo` com anotação do agente dono de cada área).
- [x] README documenta o fluxo GitFlow (feature→develop, release→main, hotfix→main+develop).

## Dependências
Nenhuma — primeira task de implementação do projeto.

## Resultado

- **Entregue em**: 2026-08-22.
- **Repositório reaproveitado**: `github.com/rodJeronimo/portfolio-fotografico` (já existia, renomeado de `portifolio-fotografico`; continha apenas um `LICENSE` — mergeado sem conflito via `git merge --allow-unrelated-histories` para preservar o histórico remoto, sem force-push).
- **Stack pinada**: `create-next-app@latest` instalou Next 16 por padrão; foi fixado explicitamente `next@^15.5.23` + `eslint-config-next@^15` para respeitar o ADR-0001 (Next.js 15 é stack fixa).
- **Ajustes de estrutura**: código de app sob `src/` (convenção `--src-dir`); `docs/architecture/folder-structure.md` atualizado para refletir o prefixo `src/` e o nome real do repo.
- **`eslint.config.mjs`**: `eslint-config-next@15.x` ainda usa formato legado (não flat-config nativo); resolvido com `FlatCompat` (`@eslint/eslintrc`), padrão oficial documentado pelo Next.js 15.
- **TypeScript strict**: `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` habilitados; exigiu ajuste no `playwright.config.ts` (spread condicional em vez de atribuir `undefined` a `webServer`).
- **Branch protection aplicada via `gh api`**: `main` — 1 review obrigatória, sem push/force-push/delete direto (`required_status_checks` ainda `null`; **pendência**: atualizar quando `ci.yml` existir — TASK-0002). `develop` — sem push/force-push/delete direto, review não obrigatória (push direto permitido).
- **Branch `master` antiga do remoto**: deletada após confirmação do usuário (conteúdo já preservado via merge em `main`).
- **Desvios em relação aos critérios de aceite**: nenhum bloqueante. Vulnerabilidades `npm audit` (esbuild dev-only, postcss/sharp internos ao bundle do Next) registradas como aceitas — não afetam runtime de produção nem nosso `sharp` próprio (0.35.3, já corrigido).
- **Commits**: `440877e` (scaffold inicial) + `494d60b` (merge do histórico remoto) em `main`; push de `main` e `develop`.
- **Pendências remanescentes**: `required_status_checks` de `main`/`develop` precisa referenciar os jobs de `ci.yml` assim que TASK-0002 for concluída.
