---
id: TASK-0008
title: "M4 — Galeria pública: Home, projetos, lightbox acessível"
milestone: M4
owner: "@frontend"
status: Backlog
depends_on: [TASK-0007]
related_docs: [docs/design/guidelines.md]
---

# TASK-0008 — M4: Galeria pública

## Contexto
Experiência pública principal: Home com grid, páginas de projeto, lightbox acessível.

## Escopo
Home com grid masonry/responsivo, `app/(public)/[locale]/projetos/[slug]/page.tsx`, lightbox (focus trap, ESC, setas, swipe mobile), breadcrumbs. Especificação de interação vem de `@ux-designer` (`docs/design/guidelines.md`, seção M4).

## Critérios de aceite
- [ ] Given usuário navega até um projeto, When clica em uma thumbnail, Then o lightbox abre focando a imagem correta.
- [ ] Given lightbox aberto, When pressiona ESC, Then fecha e retorna o foco ao elemento que abriu.
- [ ] Given lightbox aberto, When pressiona seta esquerda/direita, Then navega para foto anterior/próxima.
- [ ] Grid é responsivo sem CLS perceptível (dimensões conhecidas via schema `photo`).
- [ ] Avaliação heurística de `@ux-designer` aprovada antes de ir para `@reviewer`.

## Dependências
TASK-0007 (fotos otimizadas precisam existir para testar a galeria de ponta a ponta).

## Resultado
*(a preencher)*
