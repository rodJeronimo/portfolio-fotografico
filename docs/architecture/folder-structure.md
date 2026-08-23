# Estrutura de Pastas

```
portfolio-fotografico/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── [locale]/
│   │   │       ├── layout.tsx
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
