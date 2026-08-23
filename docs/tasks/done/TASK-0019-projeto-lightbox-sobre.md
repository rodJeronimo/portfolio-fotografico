---
id: TASK-0019
title: "Página de projeto, galeria e lightbox + Sobre (redesign fine-art)"
milestone: Redesign
owner: "@frontend"
status: Concluida
depends_on: [TASK-0016]
related_docs: [docs/design/public-site-redesign.md]
---

# TASK-0019 — Página de projeto, galeria e lightbox + Sobre (redesign fine-art)

## Contexto

Aplica o redesign fine-art à página de projeto, à galeria de fotos/lightbox e, como ajuste
menor de mesma natureza tipográfica, à página Sobre — conforme
`docs/design/public-site-redesign.md` §6, §7 e §8.

## Escopo

- `src/app/(public)/projetos/[slug]/page.tsx`: breadcrumb "← Início" (camada Label)
  substituindo "Início / Título"; eyebrow "N FOTOGRAFIAS" (singular/plural correto, omitida
  se `photos.length === 0`); H1 Fraunces 400 (`text-3xl sm:text-5xl lg:text-6xl`); descrição
  como nota curatorial (Fraunces 400 itálico, `text-lg sm:text-xl`, `max-w-2xl`,
  `text-foreground`); respiro `py-16 sm:py-24` antes do grid.
- `photo-gallery.tsx`, `grid-skeleton.tsx`, `project-grid.tsx` (thumbnails de projeto):
  cantos retos (`rounded-none`), sem `border`, `gap-6 sm:gap-8 lg:gap-10`, sem legenda
  sobreposta nas thumbnails.
- Lightbox: contador "NN / NN" (`tabular-nums`) próximo aos botões Anterior/Próxima; imagem
  sempre `object-contain` com proporção real (nunca cropada); transição de abertura/
  fechamento do `<dialog>` via CSS `@starting-style` (progressive enhancement, só
  `transform`/`opacity`, `prefers-reduced-motion: reduce` reduz duração a ~0); crossfade
  entre fotos ao navegar (`animation` só sob `prefers-reduced-motion: no-preference`).
- Avaliar (recomendação não bloqueante, §7): expandir `getPhotos()` para incluir
  `location`/`captureDate` e exibi-los como legenda abaixo da imagem no lightbox — registrar
  a decisão tomada (implementado ou adiado) na seção Resultado desta task.
- `src/app/(public)/sobre/page.tsx`: H1 Fraunces 400 `text-3xl sm:text-5xl` (era Geist Sans
  `font-semibold`); corpo permanece Geist Sans `text-base leading-relaxed` (não trocar para
  serifada, regra de nenhum uso de Fraunces abaixo de `text-lg`).
- Fora de escopo: Home (TASK-0018); sidebar/tipografia base (TASK-0016, pré-requisito);
  Contato (`/contato`, fora de escopo da spec §9); área `/admin`.

## Critérios de aceite

- [x] Given uma página de projeto, When carrega, Then mostra breadcrumb "← Início", eyebrow
      "N FOTOGRAFIAS" (singular/plural correto, omitida se 0 fotos), H1 Fraunces, descrição
      em Fraunces itálico (se houver) e respiro `py-16`+ antes do grid.
- [x] Given o grid de fotos de um projeto (ou as thumbnails de projeto), When renderizado,
      Then nenhuma foto tem `border`/`rounded-*` e nenhuma legenda está sobreposta à imagem.
- [x] Given o lightbox aberto, When o usuário navega entre fotos, Then o contador "NN / NN"
      reflete a posição atual e a imagem nunca é cropada (`object-contain`, proporção real).
- [x] Given `prefers-reduced-motion: reduce`, When o lightbox abre/fecha ou navega entre
      fotos, Then a transição/crossfade é instantânea (duração ~0), sem quebra visual (sem
      flash de conteúdo não estilizado).
- [x] Given toda transição introduzida nesta task, When inspecionada, Then usa apenas
      `transform`/`opacity` (nunca `transition: all`).
- [x] Given a página Sobre, When carrega, Then o H1 usa Fraunces e o corpo permanece Geist
      Sans `text-base`.
- [x] Nenhuma regressão de contraste AA (texto `text-xs` sempre `text-foreground`, nunca
      `text-muted`; descrição em itálico usa `text-foreground`).
- [x] `lint` e `type-check` passam sem erros.

## Dependências

TASK-0016 (sidebar/layout/tokens). Pode rodar em paralelo com TASK-0018, desde que ambas
dependam apenas de TASK-0016 já `Concluida` — recomenda-se evitar paralelismo no mesmo
working directory, conforme lição registrada no Resultado de TASK-0014/TASK-0015.

## Resultado

- Entregue em: 2026-08-23
- Resumo: breadcrumb simplificado ("← Início"), eyebrow "N FOTOGRAFIAS", H1/descrição em
  Fraunces, cantos retos no grid de fotos/thumbnails e no lightbox, contador "NN / NN" no
  lightbox, transições CSS-only (`@starting-style`/crossfade) com fallback de motion
  reduzido, H1 de Sobre migrado para Fraunces. `@reviewer` e `@qa` aprovaram sem ressalvas
  bloqueantes.
- Desvios em relação aos critérios de aceite: a recomendação não bloqueante da spec (§7 —
  expandir `getPhotos()` com `location`/`captureDate` e exibi-los no lightbox) foi
  deliberadamente adiada nesta rodada, não implementada. Registrado aqui como decisão
  consciente, a ser retomada em task futura caso priorizado.
- PR/commit relacionado: PR #27 (merged em `develop`).
- Pendências remanescentes:
  - Débito de a11y (ressalva menor de `@reviewer`, não bloqueante): o breadcrumb perdeu a
    estrutura semântica de lista com `aria-current` ao trocar "Início / Título" por um link
    único "← Início". Revisar em task futura de a11y.
  - Recomendação adiada de `getPhotos()` com `location`/`captureDate` no lightbox (ver
    desvios acima).
