# Estrutura de Pastas

```
portfolio-fotografico/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── [locale]/
│   │   │       ├── layout.tsx               # flex row (>=lg): <SiteSidebar/> + <main className="flex-1 min-w-0">, ver nota abaixo
│   │   │       ├── page.tsx                 # Home / Galeria
│   │   │       ├── sobre/page.tsx
│   │   │       ├── contato/page.tsx
│   │   │       ├── projetos/[slug]/page.tsx
│   │   │       ├── sitemap.ts
│   │   │       ├── robots.ts
│   │   │       └── opengraph-image.tsx
│   │   ├── admin/                           # sem route group — protegido via middleware.ts (matcher de path)
│   │   │   ├── layout.tsx                   # nav compartilhada (server) + AdminNav (client), ver ADR-0006
│   │   │   ├── page.tsx                     # dashboard/hub pós-login com links para as áreas de gestão
│   │   │   ├── login/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx                 # listagem de projetos
│   │   │   │   ├── actions.ts
│   │   │   │   ├── project-form.tsx
│   │   │   │   └── [projectId]/
│   │   │   │       └── fotos/
│   │   │   │           ├── page.tsx         # gestão de fotos do projeto (ver ADR-0006)
│   │   │   │           ├── actions.ts       # Server Actions de upload/CRUD/reorder
│   │   │   │           ├── upload-form.tsx
│   │   │   │           └── photo-reorder-list.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── actions.ts
│   │   │       └── settings-form.tsx
│   │   └── api/                             # Route Handlers pontuais (ex.: webhooks, se necessário)
│   ├── lib/
│   │   ├── auth/                            # config Auth.js, callbacks, allowlist
│   │   ├── storage/                         # cliente R2 (S3 SDK), presigned URLs
│   │   ├── image-pipeline/                  # sharp: resize, WebP/AVIF, LQIP, EXIF sanitize
│   │   ├── validations/                     # schemas zod
│   │   └── env.ts                           # @t3-oss/env-nextjs
│   ├── components/
│   │   ├── site-sidebar.tsx                 # nav fixa das rotas públicas (substitui site-header.tsx, ver nota abaixo)
│   │   ├── ui/                              # shadcn/ui primitives
│   │   ├── gallery/                         # grid, lightbox, thumbnails
│   │   └── admin/                           # forms, upload dropzone, drag-and-drop ordering
│   ├── db/
│   │   ├── schema.ts                        # Drizzle schema (fonte de verdade)
│   │   ├── client.ts
│   │   └── seed.ts
│   └── middleware.ts                        # protege /admin/*
├── drizzle/                             # migrations geradas por drizzle-kit
├── docs/
│   ├── ADR/                             # decisões arquiteturais (MADR)
│   ├── architecture/                    # este conjunto de documentos
│   ├── design/                          # guidelines de UX/UI (@ux-designer)
│   └── tasks/                           # board e tasks (@pm)
├── tests/
│   └── e2e/                             # Playwright
├── .claude/
│   ├── agents/                          # subagentes
│   └── CLAUDE.md
├── .github/workflows/                   # CI/CD (Fase 3)
├── next.config.ts
├── drizzle.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── vercel.json
└── .env.example
```

## Convenções

- Projeto usa `--src-dir`: todo código de aplicação vive sob `src/` (convenção padrão do `create-next-app`), `docs/`, `drizzle/`, `tests/` e `.claude/` ficam na raiz.
- `app/(public)` é route group (não afeta URL). `app/admin` **não** usa route group — implementado como pasta direta, protegida via `middleware.ts` (matcher `/admin/:path*`), não via layout de route group. Divergência do plano original aceita retroativamente em ADR-0006.
- `[locale]` prepara i18n (PT-BR default, `en` futuro) sem exigir estrutura duplicada de páginas.
- Server Actions de mutação ficam colocadas perto do domínio que afetam (ex.: `app/admin/projects/[projectId]/fotos/actions.ts`) — padrão adotado, sem centralização em `lib/actions/`.
- Rotas de fotos são sempre aninhadas sob o projeto (`admin/projects/[projectId]/fotos`), nunca soltas — toda foto pertence a um projeto via `projectPhoto` (ver ADR-0006).
- `lib/` nunca importa de `components/` (dependência unidirecional: UI depende de lib, não o contrário).
- **Navegação pública — sidebar fixa (validado por `@arquiteto` em 23/08/2026, sem ADR — ver
  justificativa abaixo):** `src/components/site-sidebar.tsx` substitui
  `src/components/site-header.tsx` como nav persistente de todas as rotas `(public)/**`,
  renderizada uma única vez em `(public)/layout.tsx`. Especificação completa (dimensões,
  breakpoints, colapso mobile) em `docs/design/public-site-redesign.md` §4. `site-header.tsx`
  é removido do código quando `@frontend` implementar a migração — não fica como componente
  morto no repositório. Não gera ADR porque não altera modelo de dados, rotas, módulos ou
  qualquer decisão de banco/storage/auth (os únicos tipos de decisão que exigem ADR neste
  projeto) — é troca de composição de UI dentro do mesmo ponto de montagem
  (`(public)/layout.tsx`), mesma classe de decisão que outras trocas de componente de
  apresentação já feitas sem ADR. `(public)/layout.tsx` passa de fragmento (`<><SiteHeader
  />{children}</>`, empilhado verticalmente pelo `flex flex-col` do `<body>` em
  `src/app/layout.tsx`) para um wrapper único `lg:flex` (sidebar `lg:sticky lg:top-0
  lg:h-dvh lg:w-[17rem] lg:shrink-0` + `<main className="flex-1 min-w-0">`) — compatível com
  `html.h-full` / `body.flex.min-h-full.flex-col` já existentes, sem introduzir nenhum
  ancestral com `overflow` próprio (o que quebraria o `position: sticky`, que depende do
  documento como contexto de scroll). Abaixo de `lg`, colapsa para barra superior + menu
  (mesmo padrão de `docs/design/admin-dashboard.md` §2.4), sem sticky.
