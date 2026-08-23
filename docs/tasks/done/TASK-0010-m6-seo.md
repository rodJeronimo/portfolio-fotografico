---
id: TASK-0010
title: "M6 — SEO: metadata dinâmica, sitemap, JSON-LD, OG images"
milestone: M6
owner: "@backend"
status: Concluida
depends_on: [TASK-0008]
related_docs: [docs/architecture/seo-strategy.md]
---

# TASK-0010 — M6: SEO

## Contexto
Implementar a estratégia de SEO definida em `docs/architecture/seo-strategy.md`.

## Escopo
`generateMetadata` por rota, `app/sitemap.ts`, `app/robots.ts`, JSON-LD `ImageGallery`/`ImageObject`, `opengraph-image.tsx` dinâmico via `next/og`.

## Critérios de aceite
- [x] `sitemap.xml` lista todas as rotas públicas + projetos, com `lastModified` correto. Validado via `curl` real (projeto real listado com `lastmod`).
- [x] `robots.txt` permite crawl público e bloqueia `/admin/*`. Validado via `curl`.
- [x] Página de projeto contém JSON-LD `ImageGallery` válido. Validado via `curl` (payload real com `ImageGallery`/`ImageObject`/`contentUrl`) — não passou por ferramenta externa de rich results (offline/sem acesso), mas a estrutura segue schema.org literalmente.
- [x] Open Graph image gerada corretamente para páginas sem foto de capa. `/opengraph-image` validado (PNG 1200×630 real). Páginas de projeto usam a foto de capa real via `generateMetadata` (validado: `og:image` apontando pro R2).
- [x] Toda `<img>`/`next/image` renderizada no público tem `alt` não vazio. Corrigido gap real: `PhotoGallery` usava `title ?? ""` (poderia renderizar alt vazio) — agora `title || "Foto de {projectTitle}"`, nunca vazio.

## Dependências
TASK-0008 (páginas públicas precisam existir para receber metadata).

## Resultado

- **`src/app/sitemap.ts`**: dinâmico, itera `project` real do Neon, `lastModified` = `project.updatedAt`.
- **`src/app/robots.ts`**: `allow: /`, `disallow: /admin/`, referencia o sitemap.
- **`src/app/opengraph-image.tsx`**: `ImageResponse` (next/og) com os tokens de design (fundo `#0c0b0a`, texto `#f2f0ee`) — usado como fallback por qualquer rota sem `generateMetadata.openGraph.images` próprio.
- **`projetos/[slug]/generateMetadata`**: agora inclui `openGraph.images` apontando para a foto de capa real (primeira foto por `display_order`) quando existe.
- **JSON-LD `ImageGallery`**: adicionado via `<script type="application/ld+json">` na página de projeto, com `associatedMedia` (array de `ImageObject`, `contentUrl`/`thumbnailUrl`/`name`).
- **`metadataBase`** configurado no layout root (`env.NEXT_PUBLIC_SITE_URL`) — necessário para URLs absolutas corretas em Open Graph.
- **Bug real corrigido**: `PhotoGallery` podia renderizar `alt=""` quando a foto não tinha título — quebra tanto a11y quanto SEO de imagem. Componente agora recebe `projectTitle` como fallback obrigatório.
- **Validação real completa**: criado projeto+foto reais (Neon+R2), `npm run dev`, confirmado via `curl`: `sitemap.xml` lista o projeto com `lastmod`, `robots.txt` correto, JSON-LD presente e estruturado, `/opengraph-image` gera PNG válido, `og:image` da página de projeto aponta pra foto real no R2. Dados de teste limpos depois.
- **Pendência**: validação formal via Google Rich Results Test / ferramenta externa não foi feita (sem acesso externo nesta sessão) — a estrutura JSON-LD segue schema.org à risca, mas vale uma checagem manual do usuário em `search.google.com/test/rich-results` quando o site estiver publicamente acessível.
