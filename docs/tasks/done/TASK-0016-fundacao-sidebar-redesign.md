---
id: TASK-0016
title: "Fundação tipográfica e sidebar de navegação (redesign fine-art)"
milestone: Redesign
owner: "@frontend"
status: Concluida
depends_on: []
related_docs: [docs/design/public-site-redesign.md, docs/architecture/folder-structure.md, docs/design/admin-dashboard.md]
---

# TASK-0016 — Fundação tipográfica e sidebar de navegação (redesign fine-art)

## Contexto

`docs/design/public-site-redesign.md` (versão final, fechada em 23/08/2026) define o
redesign fine-art do site público: segunda família tipográfica (Fraunces) para conteúdo
editorial e substituição do header horizontal por uma sidebar fixa de navegação. A mudança
estrutural (`site-header.tsx` → `site-sidebar.tsx`) já foi validada por `@arquiteto` em
23/08/2026, sem necessidade de ADR — ver nota em `docs/architecture/folder-structure.md`
(linhas ~80-92). Esta task entrega a base compartilhada por todas as páginas públicas, da
qual TASK-0018 e TASK-0019 dependem.

## Escopo

- `src/app/layout.tsx`: carregar `Fraunces` via `next/font/google` (pesos `400`/`500`,
  estilos `normal`/`italic`), expor `--font-serif` no `@theme inline` de `globals.css`
  (utilitário Tailwind `font-serif`).
- Novo `src/components/site-sidebar.tsx` substituindo `src/components/site-header.tsx` em
  `src/app/(public)/layout.tsx`:
  - Wordmark em dois pesos (nome bold + sobrenome/papel leve, mesma família Geist Sans),
    envolvido por `<Link href="/">` (§4.2). Confirmar com `@pm`/dono do site a string exata
    do texto antes de implementar — não é decisão desta task.
  - Nav vertical com 3 itens (Início/Sobre/Contato), item ativo com `aria-current="page"` +
    sublinhado (não só cor); rota `/projetos/*` também marca "Início" como ativo (§4.3).
  - Desktop (`≥lg`): `lg:w-[17rem] lg:shrink-0 lg:sticky lg:top-0 lg:h-dvh`, fundo sempre
    100% opaco (`bg-background`, nunca opacidade reduzida nem `backdrop-blur`), `border-r
    border-border` em toda a altura da página, sem exceção (§4.1, §2.1.1).
  - Mobile/tablet (`<lg`): vira barra horizontal no topo com wordmark compacto + botão de
    toggle (`aria-expanded`, `aria-controls`, alvo ≥44×44px); menu expandido empurra o
    conteúdo (não overlay), fecha ao navegar ou `Esc` — reaproveita o padrão já validado do
    nav mobile do admin (`docs/design/admin-dashboard.md` §2.4), não inventa um terceiro
    padrão de colapso (§4.4).
- Remover `src/components/site-header.tsx` e qualquer referência residual após a migração.
- O ajuste de breakpoint da 4ª coluna do grid de projetos (`lg` vs `xl`, impacto da sidebar
  na largura disponível, §4.5) é registrado aqui como nota para as tasks de Home/Projeto —
  não implementado nesta task (que não renderiza nenhum grid).

## Critérios de aceite

- [x] Given qualquer rota pública, When a página carrega, Then `--font-serif` (Fraunces)
      está disponível e NÃO é usada em nav/wordmark/botões/breadcrumb (Geist Sans nesses
      elementos).
- [x] Given desktop `≥1024px`, When o usuário visualiza qualquer rota pública, Then a
      sidebar aparece à esquerda (`17rem`, sticky, `border-r`, fundo 100% opaco, sem
      blur/opacidade reduzida) com wordmark em dois pesos e nav vertical
      Início/Sobre/Contato.
- [x] Given a rota atual é `/projetos/[slug]`, When a nav renderiza, Then o item "Início"
      aparece marcado como ativo (`aria-current="page"` + sublinhado).
- [x] Given viewport `<1024px`, When a página carrega, Then a sidebar vira barra superior
      com wordmark compacto + toggle acessível; menu expandido empurra o conteúdo (não
      overlay); fecha ao navegar ou `Esc`.
- [x] Given navegação por teclado, When o usuário percorre wordmark/nav/toggle, Then todos
      têm anel de foco visível e alvo de toque ≥44×44px.
- [x] `site-header.tsx` removido do repositório, nenhuma referência residual (import, teste,
      snapshot).
- [x] `src/app/admin/**` inalterado por esta task.
- [x] `lint` e `type-check` passam sem erros.

## Dependências

Nenhuma dependência de outra task do board — gate de arquitetura já satisfeito (validação de
`@arquiteto` registrada em `docs/architecture/folder-structure.md`). Bloqueia TASK-0018
(Home) e TASK-0019 (Projeto/lightbox/Sobre), que consomem a sidebar e a tipografia definidas
aqui.

## Resultado

Implementada em `feature/TASK-0016-fundacao-sidebar-redesign`, PR #24. Criado
`src/components/site-sidebar.tsx` (substituindo `src/components/site-header.tsx`, removido),
Fraunces carregado em `src/app/layout.tsx`, e `src/app/(public)/layout.tsx` atualizado para
layout flex com sidebar sempre sólida/opaca (decisão final registrada em
`docs/design/public-site-redesign.md` §2.1.1, sem sobreposição/vazamento de foto).
`@reviewer` e `@qa` aprovaram sem ressalvas bloqueantes.

- Entregue em: 2026-08-23
- Desvios em relação aos critérios de aceite: nenhum bloqueante. Ressalva não bloqueante
  registrada por `@reviewer` e `@qa`: a string exata do wordmark ("Rodrigo" /
  "Jerônimo · Fotógrafo") ainda não foi confirmada pelo dono do site — usado o texto literal
  da spec por ora.
- PR/commit relacionado: PR #24 (`feature/TASK-0016-fundacao-sidebar-redesign` → `develop`)
- Pendências remanescentes: confirmar com o dono do site a string definitiva do wordmark
  (não bloqueante, ajuste textual futuro se necessário).
