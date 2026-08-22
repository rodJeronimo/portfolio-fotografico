---
id: TASK-0004
title: "M0 — Fundação: design tokens, layout root, fontes"
milestone: M0
owner: "@frontend"
status: Backlog
depends_on: [TASK-0001]
related_docs: [docs/design/guidelines.md, docs/architecture/folder-structure.md]
---

# TASK-0004 — M0: Fundação

## Contexto
Base visual e estrutural sobre a qual todas as telas serão construídas: design tokens, layout raiz, fontes otimizadas.

## Escopo
Design tokens Tailwind (cores, tipografia, espaçamento — definidos por `@ux-designer` em `docs/design/guidelines.md` antes desta task ser liberada), `next/font`, `<RootLayout>`, `app/(public)/layout.tsx`, `ThemeProvider` se aplicável.

## Critérios de aceite
- [ ] `docs/design/guidelines.md` tem paleta/tipografia/breakpoints definidos por `@ux-designer` antes do início da implementação.
- [ ] `tailwind.config` reflete os tokens definidos.
- [ ] Layout root renderiza sem CLS perceptível, fontes carregadas via `next/font` (sem FOUT/FOIT visível).
- [ ] Lint e type-check passam.

## Dependências
TASK-0001. Guidelines de `@ux-designer` (`docs/design/guidelines.md`) precisam estar preenchidas antes do início.

## Resultado
*(a preencher)*
