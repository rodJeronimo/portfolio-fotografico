# Guidelines de UX/UI — Portfólio Fotográfico

Owner: `@ux-designer`. Consumido por `@frontend`. Este documento evolui conforme as telas forem desenhadas nos milestones M0–M6.

## Princípios

1. **A foto é o produto.** UI minimalista, tipografia neutra, paleta reduzida (neutros + 1 cor de destaque discreta), sem elementos decorativos competindo com as imagens.
2. **Negative space generoso.** Grids com respiro; thumbnails nunca espremidos.
3. **Performance percebida = parte da UX.** LQIP blur, skeletons, sem layout shift — carregamento deve parecer instantâneo mesmo em 4G.
4. **Consistência entre público e admin.** Mesmo design system (tokens Tailwind, componentes shadcn/ui) nas duas áreas, admin com densidade de informação maior.

> **Redesign fine-art do site público (M0.1):** ver `docs/design/public-site-redesign.md`
> para a especificação completa (tipografia editorial, estrutura de Home/projeto, motion).
> Este documento (`guidelines.md`) reflete apenas os tokens/regras que mudaram como
> resultado dessa spec; o detalhamento de layout/interação vive no documento dedicado.

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

**Atualizado (M0.1 — redesign fine-art, ver `docs/design/public-site-redesign.md`).** O site
público passa a usar **duas famílias com papéis estritamente separados**; o admin
permanece só com Geist Sans/Mono (não muda, ver "Área administrativa" abaixo).

- **Geist Sans** — UI, navegação, corpo de texto, formulários, legendas/labels. Continua
  sendo a família "neutra" que não compete com a foto.
- **Fraunces** (serifada de exibição, via `next/font/google`, pesos `400`/`500`, estilos
  `normal`/`italic`) — reservada **exclusivamente** a títulos editoriais (H1 de Home/Sobre,
  título de projeto, legendas de card no grid da Home) e a trechos de descrição em itálico
  (nota curatorial). Nunca usada em UI (botões, nav, formulário, breadcrumb) — ver
  justificativa completa e mapa de uso por elemento em `public-site-redesign.md` §2.
- `Geist Mono` inalterado — metadados técnicos (EXIF, coordenadas) no admin.

| Token | Tamanho | Família | Uso |
|---|---|---|---|
| `text-xs` | 0.75rem | Geist Sans | labels/eyebrows (uppercase, tracking largo), contadores, metadados — **sempre `text-foreground`, nunca `text-muted` neste tamanho** (ver regra de contraste abaixo) |
| `text-sm` | 0.875rem | Geist Sans | texto secundário, UI de formulário — `text-muted` permitido a partir daqui |
| `text-base` | 1rem | Geist Sans | corpo de texto |
| `text-lg`–`text-xl` | 1.125–1.25rem | Geist Sans (ou Fraunces itálico para nota curatorial) | destaque de corpo, descrição de projeto |
| `text-2xl` | 1.5rem | Geist Sans | título de seção UI (ex. "Configurações" no admin) |
| `text-3xl` | 1.875rem | Fraunces | título de página mobile (Sobre, projeto) |
| `text-4xl`–`text-5xl` | 2.25–3rem | Fraunces | título de card em destaque, título de projeto (tablet) |
| `text-6xl`–`text-7xl` | 3.75–4.5rem | Fraunces | título hero da Home (desktop) — uso restrito a este único elemento |

Peso Geist Sans: 400 (corpo), 500 (ênfase/subtítulos/UI) — nunca 700+ (evita competir
visualmente com fotos). `tracking-tight` em títulos Geist Sans ≥ `text-3xl` (telas de
admin). Peso Fraunces: 400 (padrão) ou 500 (apenas hero da Home) — **nunca `tracking-tight`
em Fraunces**, a serifa já é compacta em corpo grande e `tracking-tight` distorce as curvas
da fonte; usar tracking padrão (0).

**Regra de contraste para labels em `text-xs`:** como `--color-muted` só está verificado em
AA a partir de `text-sm` (ver Paleta abaixo), qualquer texto em `text-xs` — eyebrows, labels
de galeria, contadores — usa `text-foreground` (17.5:1), nunca `text-muted`.

### Espaçamento e breakpoints

Escala padrão do Tailwind v4 (base 0.25rem). Breakpoints padrão (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px) — suficientes para o grid da galeria (2 colunas mobile → 3 tablet → 4 desktop, ver M4). Padding de seção generoso: `px-4` mobile, `px-8` tablet, `px-16` desktop; espaço vertical entre seções `py-16`/`py-24`.

### Raio e elevação

`--radius: 0.375rem` (`rounded-md`) em cards de UI e botões — sutil, não decorativo. Sombra
apenas em overlays/modais (lightbox), nunca em cards de foto.

**Atualizado (M0.1):** o raio **não se aplica mais a fotografias** no site público (grid da
Home, grid de projeto, imagem do lightbox) — thumbnails e imagens passam a ter cantos retos
(`rounded-none`), reforçando a leitura de "print emoldurado", não "card de app". O raio
continua valendo para: chrome de UI (botões, moldura do `<dialog>` do lightbox, inputs,
cards do admin). Ver `docs/design/public-site-redesign.md` §5 para o detalhamento por
componente.

### Estados de foco

`:focus-visible` sempre com anel de 2px na cor `--color-accent`, offset de 2px — visível em qualquer fundo (claro/escuro), nunca removido via `outline: none` sem substituto.

## Área administrativa — nav e padrões de hub

O admin é operado por uma única pessoa (o fotógrafo/dono), autenticada — prioriza densidade e clareza de navegação sobre estética editorial. Ainda assim usa os mesmos tokens de cor/tipografia/raio do site público (ver M0 acima); não introduz paleta, fonte ou componente próprios.

- **Nav persistente** em todas as rotas `/admin/*` autenticadas (exceto `/admin/login`), implementada como layout compartilhado (`src/app/admin/layout.tsx` + `src/components/admin/admin-nav.tsx`). Especificação completa de estrutura, estados e comportamento mobile: `docs/design/admin-dashboard.md`.
- **Dashboard/hub (`/admin`)** usa navegação por cards descritivos como ponto de entrada para cada área de gestão (Projetos, Configurações) — título + descrição curta de uma linha, nunca ícone/imagem decorativa sem função. Princípio: "escolha por onde começar", clareza sobre profundidade — o operador nunca precisa memorizar ou digitar uma URL administrativa.
- Cards de dashboard reaproveitam o padrão visual já usado em listas do admin (`rounded-md border border-border p-*`, `text-muted` para metadados) — não introduzem componente de "card com sombra/imagem de capa" como os cards de projeto do site público; a distinção reforça que admin é ferramenta de gestão, não vitrine.
