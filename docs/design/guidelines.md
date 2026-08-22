# Guidelines de UX/UI — Portfólio Fotográfico

Owner: `@ux-designer`. Consumido por `@frontend`. Este documento evolui conforme as telas forem desenhadas nos milestones M0–M6.

## Princípios

1. **A foto é o produto.** UI minimalista, tipografia neutra, paleta reduzida (neutros + 1 cor de destaque discreta), sem elementos decorativos competindo com as imagens.
2. **Negative space generoso.** Grids com respiro; thumbnails nunca espremidos.
3. **Performance percebida = parte da UX.** LQIP blur, skeletons, sem layout shift — carregamento deve parecer instantâneo mesmo em 4G.
4. **Consistência entre público e admin.** Mesmo design system (tokens Tailwind, componentes shadcn/ui) nas duas áreas, admin com densidade de informação maior.

## A validar por milestone

- **M0 (Fundação)**: paleta de cores, escala tipográfica, tokens de espaçamento/breakpoints — a especificar aqui antes de `@frontend` configurar `tailwind.config`.
- **M4 (Galeria pública)**: grid masonry/responsivo, comportamento do lightbox (focus trap, ESC, setas, swipe mobile), breadcrumbs.
- **M2/M3 (Admin)**: usabilidade do fluxo de upload e reordenação drag-and-drop.
- **M5 (Sobre/Contato)**: hierarquia de conteúdo editorial vs formulário.

## Checklist heurístico (Nielsen 10 + WCAG 2.1 AA, aplicado por tela)

- Visibilidade do status do sistema (loading, upload em progresso, sucesso/erro).
- Consistência e padrões (mesmo componente para a mesma ação em toda a Home/Projetos/Admin).
- Prevenção de erros (confirmação antes de excluir foto/projeto).
- Reconhecimento em vez de memorização (breadcrumbs, estado ativo de navegação visível).
- Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande/ícones), alvo de toque ≥ 44x44px, foco visível em todo elemento interativo.

*(Guidelines detalhadas de paleta/tipografia/grid a preencher por `@ux-designer` no início do M0.)*
