# Estratégia de Cache e Invalidação

## ISR (Incremental Static Regeneration)

- Páginas públicas (`app/(public)/[locale]/**`) usam `export const revalidate = <segundos>` como fallback de segurança (ex.: 3600s) — regeneração periódica mesmo sem eventos.
- Invalidação sob demanda: toda mutação no admin (upload de foto, edição de projeto, edição de `SiteSettings`) chama `revalidatePath('/[locale]/projetos/[slug]')` e `revalidatePath('/[locale]')` (home/galeria) ao final do Server Action. Latência de propagação: < 60s (tipicamente segundos).
- Para listagens que dependem de múltiplos projetos (home), considerar `revalidateTag('gallery')` com `fetch`/`unstable_cache` taggeado, permitindo invalidar todas as páginas afetadas sem enumerar paths manualmente.

## Cache de imagens (R2 + CDN)

- Objetos no R2 são imutáveis por conteúdo: path inclui `storageKey` derivado de hash/uuid, nunca reaproveitado após alteração — nova foto = nova key.
- Header `Cache-Control: public, max-age=31536000, immutable` nas variantes servidas publicamente (thumbnail/medium/original), já que o path nunca muda de conteúdo.
- `next/image` com loader customizado aponta para o domínio público do R2, aproveitando o cache de borda da Vercel + Cloudflare.

## Cache de página / CDN da Vercel

- Vercel aplica stale-while-revalidate automaticamente em rotas ISR — visitantes recebem a versão em cache enquanto a regeneração acontece em background após o `revalidate` expirar ou o `revalidatePath` disparar.
- Rotas 100% estáticas (Sobre, Contato, se não dependerem de `SiteSettings` dinâmico) podem usar `dynamic = 'force-static'`.
- `sitemap.xml` e `robots.txt` gerados via Route Handlers (`app/sitemap.ts`, `app/robots.ts`) com cache padrão do Next (revalidado via ISR também).

## Resumo por tipo de conteúdo

| Conteúdo | Estratégia |
|---|---|
| Página de projeto/galeria | ISR + `revalidatePath` no upload |
| Home | ISR + `revalidatePath`/`revalidateTag('gallery')` |
| Sobre/Contato (`SiteSettings`) | ISR + `revalidatePath` na edição |
| Imagens (R2) | Cache-Control immutable, 1 ano, path por conteúdo |
| Sitemap/robots | ISR padrão (revalidação periódica) |
