---
id: TASK-0011
title: "M7 — Observabilidade e polish"
milestone: M7
owner: "@frontend"
status: Backlog
depends_on: [TASK-0010]
related_docs: []
---

# TASK-0011 — M7: Observabilidade e polish

## Contexto
Fechar lacunas de produção: analytics, tratamento de erro, estados de loading/vazio.

## Escopo
Vercel Analytics/Speed Insights, `error.tsx`, `not-found.tsx`, `loading.tsx` por rota relevante, skeletons, empty states (ex.: projeto sem fotos).

## Critérios de aceite
- [ ] Vercel Analytics e Speed Insights ativos e reportando dados.
- [ ] Toda rota pública tem `error.tsx`/`not-found.tsx` tratando falhas com UI coerente (validado por `@ux-designer`).
- [ ] Estados de loading exibem skeleton, não tela em branco.
- [ ] Projeto sem fotos exibe empty state claro em vez de grid vazio silencioso.

## Dependências
TASK-0010.

## Resultado
*(a preencher)*
