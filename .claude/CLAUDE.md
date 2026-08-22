# Portfolio Fotografico — Contexto do Projeto

Portfolio fotografico pessoal (fotografia de natureza) para exposicao de trabalho. **Sem e-commerce, carrinho ou checkout.** Paginas: Home/Galeria, Sobre Mim, Contato, e paginas de Categoria/Projeto (Paisagens, Macro, Vida Selvagem, Long Exposure). Modulo administrativo autenticado permite upload de fotos e edicao de metadados sem novo deploy.

## Stack fixa

- **Framework**: Next.js 15 (App Router, Server Components, Route Handlers, Server Actions).
- **Linguagem**: TypeScript strict.
- **Auth**: Auth.js (NextAuth v5), provider GitHub, JWT session, allowlist via `ADMIN_EMAILS`.
- **ORM**: Drizzle ORM + drizzle-kit.
- **DB**: Neon (Postgres serverless) — ver `docs/ADR/0002-neon-postgres.md`.
- **Storage/CDN**: Cloudflare R2 — ver `docs/ADR/0003-cloudflare-r2.md`.
- **Estilizacao**: Tailwind CSS v4 + shadcn/ui / Radix primitives.
- **Deploy**: Vercel (fallback documentado: Cloudflare Pages).
- **Testes**: Vitest (unit/integration) + Playwright (e2e).
- **Otimizacao de imagem**: `sharp` no upload (resize, WebP/AVIF, LQIP blur).

## Convencoes

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **Idioma**: codigo (identificadores, comentarios) em ingles; conteudo do site em PT-BR (i18n preparado, EN futuro).
- **GitFlow estrito**: `main` e `develop` long-lived; `feature/*` -> `develop`; `release/*` -> `main`; `hotfix/*` -> `main` + `develop`. Nunca push direto em `main`.
- **ADRs obrigatorios** para decisoes estruturais (DB, storage, auth, cache, particionamento de modulos), formato MADR em `docs/ADR/`.
- **PRs** exigem checklist (descricao, testes, ADRs atualizados, screenshots se UI) e aprovacao de `@qa` (verde) antes de merge.

## Quando usar qual agente

| Situacao | Agente |
|---|---|
| Quebrar milestone/feature em tasks, criterios de aceite, acompanhar status/board, registrar resultado | `@pm` |
| Nova feature (qualquer): validar impacto estrutural primeiro | `@arquiteto` |
| ADR, diagrama Mermaid, modelo de dados, estrutura de pastas | `@arquiteto` |
| Componente de UI, pagina, Tailwind, a11y, design system | `@frontend` |
| Server Action, Route Handler, schema Drizzle/migrations, upload/pipeline de imagem, auth | `@backend` |
| GitHub Actions, GitFlow, Vercel config, secrets, branch protection, CODEOWNERS | `@devops` |
| Escrever/rodar testes Vitest/Playwright, cobertura | `@qa` |
| Code review de PR, checklist de qualidade, arbitragem frontend/backend | `@reviewer` |
| Usabilidade, hierarquia visual, harmonia do design system, heurísticas UX/a11y percebida | `@ux-designer` |

## Regras de orquestracao

1. `@pm` quebra milestones/features em tasks rastreaveis em `docs/tasks/` (board `docs/tasks/BOARD.md`, uma task por entregavel, com criterios de aceite) antes de qualquer agente iniciar implementacao.
2. Toda feature nova comeca com `@arquiteto` validando impacto estrutural — task so sai de `Backlog` para `Pronta` apos essa validacao quando houver mudanca estrutural.
3. Telas/fluxos novos ou com mudanca visual relevante passam por `@ux-designer` (guidelines/heuristicas) antes ou junto da implementacao de `@frontend`.
4. `@frontend` e `@backend` nao modificam arquivos um do outro sem passar por `@reviewer`.
5. `@devops` e o unico a tocar `.github/workflows/`, `vercel.json`, `CODEOWNERS`, branch protection via `gh`.
6. `@qa` deve aprovar (green) antes de qualquer merge em `develop` ou `main`.
7. `@ux-designer` nao edita codigo de producao — apenas `docs/design/**`; implementacao e sempre de `@frontend`.
8. `@pm` atualiza o status da task e registra o "Resultado" somente apos confirmacao de `@qa` (suite verde) e `@reviewer` (PR aprovado) — nunca marca `Concluida` por conta propria.

## Documentacao viva

- `docs/architecture/` — overview, comparativos de tecnologia, modelo de dados, fluxos de sequencia, estrategias de cache/SEO/auth/seguranca, estrutura de pastas.
- `docs/ADR/` — decisoes arquiteturais formato MADR, indice em `docs/ADR/README.md`.
- `docs/design/` — guidelines de UX/UI mantidas por `@ux-designer`.
- `docs/tasks/` — board de tasks (`BOARD.md`), tasks individuais (`backlog/`, `done/`) e template (`TEMPLATE.md`), mantidos por `@pm`.
