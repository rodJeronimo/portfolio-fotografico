---
id: TASK-0002
title: Pipeline CI/CD via GitHub Actions
milestone: Fase3
owner: "@devops"
status: Backlog
depends_on: [TASK-0001]
related_docs: [docs/ADR/0005-gitflow.md]
---

# TASK-0002 — Pipeline CI/CD via GitHub Actions

## Contexto
Fase 3 do plano: workflows que aplicam os gates de qualidade (lint, type-check, testes, e2e, preview, release, hotfix) alinhados ao GitFlow.

## Escopo
`.github/workflows/{ci,e2e,preview,release,hotfix}.yml` conforme especificado no briefing original; `.env.example` com todas as variáveis (sem valores reais).

## Critérios de aceite
- [ ] `ci.yml` roda lint/type-check/test/build em paralelo em PRs para `develop` e `main`, com upload de cobertura.
- [ ] `e2e.yml` roda Playwright contra preview deploy em PRs para `main`.
- [ ] `preview.yml` gera deploy preview na Vercel em PRs para `develop` e comenta a URL no PR.
- [ ] `release.yml` faz deploy de produção em push/tag em `main` e gera release notes via `gh release create`.
- [ ] `hotfix.yml` roda CI + deploy emergencial + sincroniza de volta para `develop`.
- [ ] `.env.example` lista `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_EMAILS`, `STORAGE_*`, `NEXT_PUBLIC_SITE_URL`.

## Dependências
TASK-0001 (projeto e repositório precisam existir).

## Resultado
*(a preencher)*
