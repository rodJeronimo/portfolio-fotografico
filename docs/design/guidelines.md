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

## M0 — Paleta, tipografia e tokens

### Paleta de cores

Neutros dominam; uma única cor de destaque (accent), usada com moderação (links ativos, foco, CTA principal, estado ativo de navegação) — nunca em blocos grandes que competiriam com as fotos.

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-background` | `#fafaf9` (near-white, leve tom quente) | `#0c0b0a` (near-black) | fundo de página |
| `--color-foreground` | `#171412` | `#f2f0ee` | texto principal |
| `--color-muted` | `#78716c` | `#a8a29e` | texto secundário, legendas, metadados EXIF |
| `--color-border` | `#e7e5e4` | `#292524` | divisores, bordas de card |
| `--color-surface` | `#ffffff` | `#151312` | cards, painel admin |
| `--color-accent` | `#b45309` (âmbar/terracota — "golden hour") | `#d97706` | foco, link ativo, botão primário, indicador de estado |
| `--color-accent-foreground` | `#fffaf0` | `#1c1917` | texto sobre accent |
| `--color-danger` | `#b91c1c` | `#f87171` | erros, exclusão |

Justificativa: tom terracota/âmbar remete a luz natural (golden hour) sem ser saturado o suficiente para brigar com fotos de paisagem/vida selvagem. Fundo levemente quente (não `#ffffff` puro) para não criar contraste duro contra fotos com tons quentes.

Contraste verificado (calculado, WCAG 2.1): `foreground`/`background` ≈ 17.5:1 (AAA) em ambos os temas; `accent-foreground`/`accent` ≈ 4.8:1 light / 5.5:1 dark (AA para texto normal); `muted`/`background` ≈ 4.6:1 light / 7.8:1 dark (AA — usar `muted` só para texto ≥ `text-sm`, não para texto minúsculo).

### Tipografia

Uma única família (Geist Sans, via `next/font`, já otimizada — sem FOUT/FOIT) para UI e conteúdo; `Geist Mono` reservado para metadados técnicos (EXIF, coordenadas) no admin. Sem serifa — mantém a interface neutra diante das fotos.

| Token | Tamanho | Uso |
|---|---|---|
| `text-xs` | 0.75rem | legendas, metadados |
| `text-sm` | 0.875rem | texto secundário, UI de formulário |
| `text-base` | 1rem | corpo de texto |
| `text-lg` | 1.125rem | destaque de corpo |
| `text-xl` | 1.25rem | subtítulo de card/projeto |
| `text-2xl` | 1.5rem | título de seção |
| `text-3xl` | 1.875rem | título de página (mobile) |
| `text-4xl`–`text-5xl` | 2.25–3rem | título de página (desktop), hero |

Peso: 400 (corpo), 500 (ênfase/subtítulos), 600 (títulos) — nunca 700+ (evita competir visualmente com fotos). `tracking-tight` em títulos ≥ `text-3xl`.

### Espaçamento e breakpoints

Escala padrão do Tailwind v4 (base 0.25rem). Breakpoints padrão (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px) — suficientes para o grid da galeria (2 colunas mobile → 3 tablet → 4 desktop, ver M4). Padding de seção generoso: `px-4` mobile, `px-8` tablet, `px-16` desktop; espaço vertical entre seções `py-16`/`py-24`.

### Raio e elevação

`--radius: 0.375rem` (`rounded-md`) em cards e botões — sutil, não decorativo (mantém sensação de "galeria", não de app consumer genérico). Sombra apenas em overlays/modais (lightbox), nunca em cards de foto (a própria foto já tem contraste suficiente).

### Estados de foco

`:focus-visible` sempre com anel de 2px na cor `--color-accent`, offset de 2px — visível em qualquer fundo (claro/escuro), nunca removido via `outline: none` sem substituto.
