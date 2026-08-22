---
id: TASK-0010
title: "M6 — SEO: metadata dinâmica, sitemap, JSON-LD, OG images"
milestone: M6
owner: "@backend"
status: Backlog
depends_on: [TASK-0008]
related_docs: [docs/architecture/seo-strategy.md]
---

# TASK-0010 — M6: SEO

## Contexto
Implementar a estratégia de SEO definida em `docs/architecture/seo-strategy.md`.

## Escopo
`generateMetadata` por rota, `app/sitemap.ts`, `app/robots.ts`, JSON-LD `ImageGallery`/`ImageObject`, `opengraph-image.tsx` dinâmico via `next/og`.

## Critérios de aceite
- [ ] `sitemap.xml` lista todas as rotas públicas + projetos, com `lastModified` correto.
- [ ] `robots.txt` permite crawl público e bloqueia `/admin/*`.
- [ ] Página de projeto contém JSON-LD `ImageGallery` válido (validado via ferramenta de teste de rich results).
- [ ] Open Graph image gerada corretamente para páginas sem foto de capa.
- [ ] Toda `<img>`/`next/image` renderizada no público tem `alt` não vazio.

## Dependências
TASK-0008 (páginas públicas precisam existir para receber metadata).

## Resultado
*(a preencher)*
