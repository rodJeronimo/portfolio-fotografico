# Estratégia de SEO

## Metadata dinâmica (App Router Metadata API)

- `generateMetadata` em cada rota pública (`app/(public)/[locale]/page.tsx`, `.../projetos/[slug]/page.tsx`, `.../sobre/page.tsx`, `.../contato/page.tsx`), buscando título/descrição do DB (`project.title`/`description` ou `site_settings`).
- `alternates.languages` populado para PT-BR/EN (i18n preparado desde o início, mesmo com apenas PT-BR ativo no MVP).
- `metadataBase` configurado via `NEXT_PUBLIC_SITE_URL`.

## Open Graph

- `openGraph.images` usando a `cover_photo` do projeto (ou foto de destaque da Home), servida via `next/image`/URL pública do R2.
- Imagens OG dinâmicas via `next/og` (`app/**/opengraph-image.tsx`) como alternativa/complemento para páginas sem foto de capa definida (ex.: Sobre, Contato).
- `twitter` card `summary_large_image`.

## Sitemap e robots

- `app/sitemap.ts` — gera XML dinamicamente iterando `project` (via Drizzle) + rotas estáticas (Home, Sobre, Contato), com `lastModified` a partir de `updated_at`.
- `app/robots.ts` — permite crawl de rotas públicas, **disallow explícito de `/admin/*`**.

## JSON-LD

- Página de projeto: `schema.org/ImageGallery` com `associatedMedia` listando `ImageObject` (cada foto: `contentUrl`, `thumbnailUrl`, `name`, `description`, `datePublished`/`captureDate`).
- Home: `schema.org/Person` ou `ProfilePage` para o fotógrafo (nome, bio, link social) alimentado por `site_settings`.
- Injeção via `<script type="application/ld+json">` em Server Component, sem impacto no bundle client.

## Imagens

- `alt` obrigatório no schema `Photo` (campo `description` ou `title` como fallback) — validado por `@reviewer` como bloqueante.
- `next/image` com `sizes` corretos por breakpoint, evitando download de variante maior que o necessário (impacta LCP e SEO de performance).

## Core Web Vitals

- LCP < 2.5s em 4G: hero/capa da Home como `priority` no `next/image`, demais fotos lazy.
- CLS ~0: `width`/`height` sempre presentes (armazenados no schema `photo`), `blurDataURL` como placeholder.
- INP: interações do lightbox otimizadas (sem JS bloqueante, Client Component isolado).
