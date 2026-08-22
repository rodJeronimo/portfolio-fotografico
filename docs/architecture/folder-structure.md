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
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx               # aplica verificação de sessão (via middleware)
│   │   │       ├── login/page.tsx
│   │   │       ├── projetos/
│   │   │       │   ├── page.tsx             # listagem
│   │   │       │   ├── novo/page.tsx
│   │   │       │   └── [id]/page.tsx        # editar projeto + fotos
│   │   │       └── fotos/
│   │   │           ├── page.tsx             # listagem geral
│   │   │           └── actions.ts           # Server Actions de upload/CRUD
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
- `app/(public)` e `app/(admin)` são route groups — não afetam a URL, apenas organizam layouts/middlewares distintos.
- `[locale]` prepara i18n (PT-BR default, `en` futuro) sem exigir estrutura duplicada de páginas.
- Server Actions de mutação ficam colocadas perto do domínio que afetam (`app/(admin)/admin/fotos/actions.ts`) ou centralizadas em `lib/actions/` se compartilhadas — decisão final de `@backend` ao implementar M2.
- `lib/` nunca importa de `components/` (dependência unidirecional: UI depende de lib, não o contrário).
