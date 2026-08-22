---
id: TASK-0002
title: Pipeline CI/CD via GitHub Actions
milestone: Fase3
owner: "@devops"
status: Em revisao
depends_on: [TASK-0001]
related_docs: [docs/ADR/0005-gitflow.md]
---

# TASK-0002 — Pipeline CI/CD via GitHub Actions

## Contexto
Fase 3 do plano: workflows que aplicam os gates de qualidade (lint, type-check, testes, e2e, preview, release, hotfix) alinhados ao GitFlow.

## Escopo
`.github/workflows/{ci,e2e,preview,release,hotfix}.yml` conforme especificado no briefing original; `.env.example` com todas as variáveis (sem valores reais).

## Critérios de aceite
- [x] `ci.yml` roda lint/type-check/test/build em paralelo em PRs para `develop` e `main`, com upload de cobertura.
- [x] `e2e.yml` roda Playwright contra preview deploy em PRs para `main`.
- [x] `preview.yml` gera deploy preview na Vercel em PRs para `develop` e comenta a URL no PR.
- [x] `release.yml` faz deploy de produção em push/tag em `main` e gera release notes via `gh release create`.
- [x] `hotfix.yml` roda CI + deploy emergencial + sincroniza de volta para `develop`.
- [x] `.env.example` lista `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_EMAILS`, `STORAGE_*`, `NEXT_PUBLIC_SITE_URL` (já existia desde TASK-0001).

## Dependências
TASK-0001 (projeto e repositório precisam existir).

## Resultado

- **PR**: [#1](https://github.com/rodJeronimo/portfolio-fotografico/pull/1) `feature/TASK-0002-pipeline-cicd` → `develop`.
- **CI do próprio PR**: Lint/Type check/Unit tests/Build verdes. `Deploy preview (Vercel)` falha — **esperado**, depende dos secrets `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` que só existirão após TASK-0003.
- **Desvio corrigido durante a task**: `type-check` falhava no CI (mas não localmente) porque `tsc --noEmit` rodava sem os tipos de rota gerados pelo Next 15 (`LayoutProps`). Corrigido com `next typegen && tsc --noEmit`.
- **Design decisions**: `hotfix.yml` faz apenas CI + deploy de *preview* emergencial (não produção) — o deploy de produção e a sincronização `main` → `develop` acontecem em `release.yml` quando o PR do hotfix é mergeado em `main`, evitando duplicar lógica de deploy entre dois workflows.
- **Pendências remanescentes**: merge do PR aguardando aprovação do usuário (ação de escrita em repositório compartilhado bloqueada pelo classificador de auto mode). `required_status_checks` de `main`/`develop` ainda não referencia os checks deste workflow — atualizar após o merge.
