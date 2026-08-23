# Memória — Convenções

Guidelines completas de design: `docs/design/guidelines.md`. Regras de orquestração completas: `.claude/CLAUDE.md`.

## Código
- TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- Identificadores/comentários em inglês; conteúdo do site em PT-BR.
- Conventional Commits.
- `npm run type-check` = `next typegen && tsc --noEmit` (precisa do typegen antes, senão `LayoutProps`/`PageProps` não resolvem em ambiente limpo).

## Git / GitFlow
- `main`/`develop` long-lived. **Toda task vira `feature/TASK-NNNN-slug` a partir de `develop`, com PR de volta** — sem exceção, mesmo para bookkeeping pequeno.
- Squash merge é o padrão usado até agora.
- PRs entre branches divergentes tendem a conflitar em `docs/tasks/BOARD.md` (mesmas linhas de tabela) — resolver localmente com `git merge origin/develop` antes de re-tentar o merge do PR.

## Design (M0, `docs/design/guidelines.md`)
- Paleta neutra + 1 accent âmbar/terracota (`#b45309` light / `#d97706` dark) — "golden hour", nunca compete com as fotos.
- Tailwind v4 é **CSS-first** (`@theme` em `globals.css`), não há `tailwind.config.ts` neste projeto.
- Tipografia única (Geist Sans/Mono via `next/font`), sem peso > 600.
- Contraste WCAG AA verificado nos tokens atuais (ver `docs/design/guidelines.md` para os números).

## Erros já resolvidos (não repetir)
- `eslint-config-next@15.x` precisa de `FlatCompat` (`@eslint/eslintrc`) — não é flat-config nativo como o 16.x que o `create-next-app` instala por padrão.
- Token Vercel de conta Team quebra `pull`/`build --prebuilt`/`whoami` — usar `vercel deploy` puro.
- `GITHUB_TOKEN` do job precisa de `permissions: pull-requests: write` explícito para `actions/github-script` comentar em PR (default é read-only).
