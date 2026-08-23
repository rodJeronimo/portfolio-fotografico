---
id: TASK-0018
title: "Home: bloco de destaque e grid (redesign fine-art)"
milestone: Redesign
owner: "@frontend"
status: Concluida
depends_on: [TASK-0016, TASK-0017]
related_docs: [docs/design/public-site-redesign.md, docs/ADR/0007-home-featured-project-setting.md]
---

# TASK-0018 — Home: bloco de destaque e grid (redesign fine-art)

## Contexto

Aplica o redesign fine-art à Home (`src/app/(public)/page.tsx`): bloco de destaque
"momento de entrada" (agora resolvido via `getFeaturedProject()`, TASK-0017, com fallback
automático por `displayOrder`) e grid dos projetos restantes com cantos retos e legendas
sempre visíveis, conforme `docs/design/public-site-redesign.md` §5.

## Escopo

- Bloco de destaque: capa do projeto resolvido por `getFeaturedProject()` (TASK-0017),
  `object-cover`, `h-[70vh] sm:h-[80vh] lg:h-dvh` dentro da área de conteúdo, sem texto
  sobreposto; eyebrow "PROJETO EM DESTAQUE" + título Fraunces 500
  (`text-4xl sm:text-6xl lg:text-7xl`, `leading-[1.05]`) abaixo da imagem, link único para
  `/projetos/[slug]`.
- Seta de scroll acessível: âncora real (`<a href="#projetos-restantes">`), ícone
  `aria-hidden="true"`, texto `sr-only` ("Ver mais projetos"), animação `translateY`
  **somente** sob `@media (prefers-reduced-motion: no-preference)`.
- Imagem do destaque é a única com `priority`/`fetchpriority="high"` na Home.
- Grid dos projetos restantes (exclui o já usado no destaque): `gap-6 sm:gap-8 lg:gap-10`,
  cantos retos (`rounded-none`, sem `border`), legenda sempre visível
  (`<figure>`/`<figcaption>`: índice de 2 dígitos `tabular-nums` + travessão + título
  Fraunces 400), hover/focus `scale-[1.03]` (só `transform`), sem transição sob
  `prefers-reduced-motion: reduce`.
- Ajustar o breakpoint da 4ª coluna do grid (`lg` vs `xl`) conforme a largura real disponível
  após a sidebar (§4.5) — decisão de implementação, validar visualmente.
- Estados: 1 projeto publicado → mostra só o destaque, sem grid abaixo; 0 projetos → mantém
  o estado vazio atual.
- Fora de escopo: página de projeto, lightbox, Sobre (TASK-0019); UI de admin do destaque
  (TASK-0020); sidebar/tipografia base (TASK-0016, pré-requisito).

## Critérios de aceite

- [x] Given a Home carrega, When não há `home.featuredProjectId` configurado, Then o
      destaque é o primeiro projeto por `displayOrder` (comportamento automático).
- [x] Given `home.featuredProjectId` aponta para um projeto válido, When a Home carrega,
      Then o destaque é esse projeto (não necessariamente o primeiro por `displayOrder`).
- [x] Given o bloco de destaque renderiza, When inspecionado, Then nenhum texto está
      sobreposto à área de pixels da foto (título/eyebrow sempre abaixo da imagem).
- [x] Given `prefers-reduced-motion: reduce`, When a Home carrega, Then a seta de scroll não
      anima (fica estática).
- [x] Given o grid de projetos restantes, When renderizado, Then nenhuma foto tem
      `border`/`rounded-*` (cantos retos) e a legenda (índice + travessão + título) está
      sempre visível, sem depender de hover.
- [x] Given 1 projeto publicado, When a Home carrega, Then só o bloco de destaque aparece
      (sem grid abaixo). Given 0 projetos, Then mantém o estado vazio atual.
- [x] Apenas a imagem do bloco de destaque tem `priority`/`fetchpriority="high"`; demais
      imagens mantêm `loading="lazy"`.
- [x] `lint` e `type-check` passam sem erros.

## Dependências

TASK-0016 (sidebar/layout/tokens) e TASK-0017 (`getFeaturedProject()`) — ambas devem estar
`Concluida` antes de iniciar.

## Resultado

- Entregue em: 2026-08-23
- Resumo: bloco de destaque da Home implementado via `getFeaturedProject()` (TASK-0017),
  grid dos projetos restantes com cantos retos e legenda sempre visível, seta de scroll
  acessível (âncora real, `aria-hidden` no ícone, texto `sr-only`, animação só sob
  `prefers-reduced-motion: no-preference`). `@reviewer` e `@qa` aprovaram sem ressalvas
  bloqueantes.
- Desvios em relação aos critérios de aceite: nenhum. Durante a implementação o agente
  relatou um incidente de leitura acidental de um diretório compartilhado; `@reviewer` e
  `@qa` confirmaram que o diff final ficou limpo, sem resíduo — apenas os 3 arquivos
  esperados foram alterados.
- PR/commit relacionado: PR #28 (merged em `develop`).
- Pendências remanescentes: nenhuma.
