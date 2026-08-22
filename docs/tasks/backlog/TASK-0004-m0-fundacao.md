---
id: TASK-0004
title: "M0 — Fundação: design tokens, layout root, fontes"
milestone: M0
owner: "@frontend"
status: Em revisao
depends_on: [TASK-0001]
related_docs: [docs/design/guidelines.md, docs/architecture/folder-structure.md]
---

# TASK-0004 — M0: Fundação

## Contexto
Base visual e estrutural sobre a qual todas as telas serão construídas: design tokens, layout raiz, fontes otimizadas.

## Escopo
Design tokens Tailwind (cores, tipografia, espaçamento — definidos por `@ux-designer` em `docs/design/guidelines.md` antes desta task ser liberada), `next/font`, `<RootLayout>`, `app/(public)/layout.tsx`, `ThemeProvider` se aplicável.

## Critérios de aceite
- [x] `docs/design/guidelines.md` tem paleta/tipografia/breakpoints definidos por `@ux-designer` antes do início da implementação.
- [x] Tokens Tailwind v4 (`@theme` em `globals.css` — CSS-first, não há `tailwind.config` neste projeto) refletem os valores definidos.
- [x] Layout root renderiza sem CLS perceptível, fontes carregadas via `next/font` (sem FOUT/FOIT visível — já era assim no scaffold, mantido).
- [x] Lint e type-check passam.

## Dependências
TASK-0001. Guidelines de `@ux-designer` (`docs/design/guidelines.md`) precisam estar preenchidas antes do início.

## Resultado

- **Guidelines** (`docs/design/guidelines.md`): seção "M0 — Paleta, tipografia e tokens" preenchida — paleta neutra + accent âmbar/terracota (light/dark), escala tipográfica, espaçamento/breakpoints (padrão Tailwind), raio, estado de foco. Contraste calculado e documentado (WCAG 2.1): `foreground`/`background` ≈ 17.5:1, `accent-foreground`/`accent` ≈ 4.8–5.5:1, `muted`/`background` ≈ 4.6–7.8:1 — todos ≥ AA.
- **`src/app/globals.css`**: tokens como custom properties (`:root` + `prefers-color-scheme: dark`), mapeados via `@theme inline` (Tailwind v4 é CSS-first — não existe `tailwind.config.ts` neste projeto, ao contrário do que o escopo original presumia). Gera utilities automáticas (`bg-background`, `text-muted`, `border-border`, `bg-accent`, etc).
- **`src/app/layout.tsx`**: metadata com `title.template`, `lang="pt-BR"`, mantém `next/font` (Geist Sans/Mono) do scaffold.
- **`src/app/page.tsx`**: placeholder mínimo usando os tokens (título + descrição) — a galeria real é escopo de M4 (TASK-0008), não desta task.
- **Desvio de escopo**: route groups `app/(public)/[locale]/layout.tsx` **não** foram criados agora — introduzi-los sem páginas reais seria estrutura prematura. Ficam para quando as rotas públicas (M4) e admin (M1/M2) forem implementadas de fato, usando os tokens definidos aqui.
- **Validação**: `npm run lint`, `npm run type-check`, `npm run build` verdes; smoke test do `npm run dev` confirmou renderização (HTTP 200, `<h1>` correto).
