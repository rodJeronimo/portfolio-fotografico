---
id: TASK-0019
title: "Página de projeto, galeria e lightbox + Sobre (redesign fine-art)"
milestone: Redesign
owner: "@frontend"
status: Pronta
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

- [ ] Given uma página de projeto, When carrega, Then mostra breadcrumb "← Início", eyebrow
      "N FOTOGRAFIAS" (singular/plural correto, omitida se 0 fotos), H1 Fraunces, descrição
      em Fraunces itálico (se houver) e respiro `py-16`+ antes do grid.
- [ ] Given o grid de fotos de um projeto (ou as thumbnails de projeto), When renderizado,
      Then nenhuma foto tem `border`/`rounded-*` e nenhuma legenda está sobreposta à imagem.
- [ ] Given o lightbox aberto, When o usuário navega entre fotos, Then o contador "NN / NN"
      reflete a posição atual e a imagem nunca é cropada (`object-contain`, proporção real).
- [ ] Given `prefers-reduced-motion: reduce`, When o lightbox abre/fecha ou navega entre
      fotos, Then a transição/crossfade é instantânea (duração ~0), sem quebra visual (sem
      flash de conteúdo não estilizado).
- [ ] Given toda transição introduzida nesta task, When inspecionada, Then usa apenas
      `transform`/`opacity` (nunca `transition: all`).
- [ ] Given a página Sobre, When carrega, Then o H1 usa Fraunces e o corpo permanece Geist
      Sans `text-base`.
- [ ] Nenhuma regressão de contraste AA (texto `text-xs` sempre `text-foreground`, nunca
      `text-muted`; descrição em itálico usa `text-foreground`).
- [ ] `lint` e `type-check` passam sem erros.

## Dependências

TASK-0016 (sidebar/layout/tokens). Pode rodar em paralelo com TASK-0018, desde que ambas
dependam apenas de TASK-0016 já `Concluida` — recomenda-se evitar paralelismo no mesmo
working directory, conforme lição registrada no Resultado de TASK-0014/TASK-0015.

## Resultado

*(preenchido pelo @pm ao final, com base no relato do agente responsável e na aprovação de @qa/@reviewer)*

- Entregue em:
- Desvios em relação aos critérios de aceite:
- PR/commit relacionado:
- Pendências remanescentes:
