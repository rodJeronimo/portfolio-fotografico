# Arquitetura — Visão Geral

Stack monolítica Next.js 15 (App Router) hospedada na Vercel, sem microsserviços, sem Kubernetes. Um único deploy serve tanto o site público quanto o painel administrativo, diferenciados por route groups e middleware de autenticação.

```mermaid
flowchart TB
    subgraph Clients["Clientes"]
        Visitor["Visitante\n(browser publico)"]
        Admin["Administrador\n(browser admin)"]
    end

    subgraph Vercel["Vercel — Next.js 15 (App Router monolito)"]
        direction TB
        Public["app/(public)/[locale]/**\nServer Components + ISR"]
        AdminUI["app/(admin)/admin/**\nServer + Client Components"]
        Middleware["middleware.ts\nprotege /admin/*"]
        Actions["Server Actions\n(upload, CRUD projeto/foto)"]
        API["Route Handlers\n(og image, sitemap, robots)"]
        AuthJS["Auth.js v5\nGitHub OAuth + JWT session"]
    end

    subgraph DataLayer["Camada de dados"]
        Drizzle["Drizzle ORM"]
        Neon[("Neon\nPostgres serverless")]
    end

    subgraph StorageLayer["Camada de binarios"]
        Sharp["Pipeline sharp\nresize / WebP+AVIF / LQIP"]
        R2[("Cloudflare R2\nobject storage + CDN")]
    end

    subgraph CI["GitHub Actions"]
        CIWorkflow["ci.yml / e2e.yml / preview.yml / release.yml / hotfix.yml"]
    end

    Visitor -->|HTTPS| Public
    Admin -->|HTTPS| Middleware --> AdminUI
    AdminUI -->|login| AuthJS
    AdminUI -->|upload foto + metadados| Actions
    Actions -->|valida sessao + allowlist ADMIN_EMAILS| AuthJS
    Actions -->|presigned PUT| R2
    Actions -->|processa variantes| Sharp
    Sharp --> R2
    Actions -->|grava metadados| Drizzle --> Neon
    Actions -->|revalidatePath/Tag| Public
    Public -->|SELECT projetos/fotos| Drizzle
    Public -->|next/image via dominio publico| R2
    API --> Drizzle

    CIWorkflow -->|deploy| Vercel

    classDef store fill:#eef,stroke:#446,stroke-width:1px;
    class Neon,R2 store;
```

## Componentes

- **Público (`app/(public)`)**: Home/Galeria, Sobre, Contato, páginas de Projeto/Categoria (`[slug]`). Renderizado via Server Components com ISR (`revalidate` + `revalidatePath` sob demanda).
- **Admin (`app/(admin)/admin`)**: protegido por `middleware.ts`, que verifica sessão JWT do Auth.js e allowlist de e-mail. CRUD de projetos/fotos via Server Actions, sem necessidade de API REST separada.
- **Auth.js v5**: provider GitHub OAuth, sessão JWT (sem tabela de sessão no DB), callback `signIn` valida contra `ADMIN_EMAILS`.
- **Drizzle + Neon**: metadados relacionais (Project, Photo, ProjectPhoto, SiteSettings).
- **Pipeline `sharp` + R2**: no momento do upload, gera variantes (thumbnail, medium, original) em WebP/AVIF + LQIP blur placeholder; grava no R2; URL pública servida via `next/image` com loader customizado apontando para o domínio público do bucket.
- **GitHub Actions**: CI (lint/type-check/test/build), e2e (Playwright contra preview), preview deploy por PR, release para produção, hotfix.

Ver detalhamento em `upload-flow.md` (sequência), `data-model.md` (schema), `caching-strategy.md`, `seo-strategy.md`, `auth-strategy.md`, `security.md`, `folder-structure.md`.
