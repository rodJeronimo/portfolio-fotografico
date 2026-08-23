# Especificação de layout — Dashboard e navegação admin

Owner: `@ux-designer`. Consumido por `@frontend` na implementação de ADR-0006
(`docs/ADR/0006-admin-dashboard-navigation.md`). Escopo: `src/app/admin/layout.tsx`,
`src/components/admin/admin-nav.tsx`, `src/app/admin/page.tsx`.

Este documento não substitui o ADR (que define estrutura de arquivos/rotas) — especifica
a camada visual e de interação sobre a estrutura já decidida.

## 1. Contexto e princípio

Hoje `/admin` é uma tela placeholder ("Autenticado com sucesso.") sem navegação — o
operador (dono/único admin) precisa conhecer as URLs de cor. O princípio adotado, inspirado
na navegação por cards de `alerodrigues.com` (card-based entry points com descrição
textual, não a estética fine-art do site) — **não** a estética do site, é:

> Toda rota administrativa deve ser alcançável por um link visível e descrito, nunca por
> memorização de URL. Card = ponto de entrada com contexto ("o que eu encontro aqui"), não
> apenas um rótulo.

Aplicado em duas camadas complementares:
1. **Nav persistente** (acesso rápido, qualquer tela → qualquer área, 1 clique).
2. **Hub em `/admin`** (visão geral com descrição de cada área, ponto de partida após login).

## 2. Nav persistente (`admin-nav.tsx` + `layout.tsx`)

### 2.1 Posição

**Header horizontal** (não sidebar). Justificativa: o admin tem hoje apenas 3 destinos de
primeiro nível (Dashboard, Projetos, Configurações) mais logout — uma sidebar seria
espaço desperdiçado e introduziria um segundo padrão de "coluna lateral fixa" que não
existe em nenhuma outra tela do site (site público não usa sidebar). Header horizontal
mantém consistência com o resto do produto e é naturalmente responsivo (colapsa em menu
mobile) sem exigir gerenciamento de largura de coluna.

Se o número de áreas administrativas crescer além de ~5 itens no futuro, reavaliar sidebar
— não é decisão definitiva, é a escolha correta para o escopo atual.

### 2.2 Estrutura

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo/"Admin"]   Dashboard   Projetos   Configurações   [Sair]│
└──────────────────────────────────────────────────────────────┘
```

- Container: `border-b border-border`, fundo `bg-background` (mesmo tom do body, sem
  destacar-se como "barra de app" genérica), `px-4 md:px-8`, altura ~`h-14`/`h-16`.
- À esquerda: rótulo estático "Admin" (`text-sm font-medium`, não é logo do site público —
  evita confundir área de gestão com área pública), **não é um link** (não há "home" fora
  do dashboard para o admin; se o operador estiver no dashboard e clicar em "Admin", nada
  deveria acontecer — por isso é texto simples, não `<Link>`, evitando alvo de toque morto
  ou redundante com o item "Dashboard").
- Centro/próximo ao rótulo: itens de nav — **Dashboard**, **Projetos**, **Configurações**
  — nesta ordem fixa (reflete `docs/ADR/0006`).
- À direita: ação **Sair** (logout), visualmente separada dos itens de navegação (ex.:
  `border-l border-border pl-4 ml-auto` ou simplesmente `ml-auto`) — não é um item de
  navegação, é uma ação destrutiva de sessão; distinção visual evita clique acidental.

### 2.3 Item ativo

- Rota ativa determinada por `usePathname()` no client component, comparando prefixo:
  `/admin` ativo somente em match exato (`pathname === "/admin"`); `/admin/projects` ativo
  para `pathname === "/admin/projects"` **e** para qualquer sub-rota
  (`/admin/projects/[id]/fotos`) via `pathname.startsWith("/admin/projects")`;
  `/admin/settings` ativo para `pathname.startsWith("/admin/settings")`.
- Estado ativo: cor `text-accent` + `font-medium`, mais um indicador não-só-de-cor (não
  depender de cor isoladamente — WCAG 1.4.1): sublinhado (`underline underline-offset-4`)
  ou `border-b-2 border-accent` no item ativo. Itens inativos: `text-foreground` (ou
  `text-muted` se preferir reduzir peso visual — decisão de `@frontend`, mantendo contraste
  AA).
- Item ativo também recebe `aria-current="page"` (não apenas classe visual) para leitores
  de tela.

### 2.4 Comportamento mobile

Abaixo de `md` (768px): itens de nav colapsam em menu hambúrguer.

- Botão de toggle (`<button aria-expanded aria-controls="admin-nav-menu">`) com ícone
  hambúrguer/X, alvo de toque ≥ 44×44px, posicionado à direita do rótulo "Admin" (antes de
  "Sair", que permanece sempre visível — logout é ação crítica demais para esconder atrás
  de um menu, mesmo em mobile).
- Menu expandido: painel que empurra o conteúdo abaixo do header (não overlay sobre o
  conteúdo — admin não tem galeria/imagem por trás que justifique overlay; empurrar é mais
  simples de implementar e não exige backdrop/scroll-lock) — `flex flex-col`, itens
  empilhados, cada um com alvo de toque ≥ 44px de altura (`py-3`).
- Fecha ao navegar (troca de rota) e ao pressionar `Esc`.
- Focus trap **não é necessário** para este menu (não é modal/overlay bloqueante — é
  conteúdo inline que desloca o layout); basta garantir que a ordem de tab siga a ordem
  visual (DOM order) e que o botão de toggle tenha foco visível.

### 2.5 Logout

- `signOut` (`@/lib/auth`) via Server Action em `<form action={...}>`, mesmo padrão já
  usado em `admin/login/page.tsx` para `signIn` — sem necessidade de client-side fetch.
  Botão de submit estilizado como link/texto discreto (não botão primário — logout não é a
  ação que se quer destacar visualmente), mas sempre visível, nunca dentro do menu mobile
  colapsado (ver 2.4).
- Sem modal de confirmação — logout não é destrutivo/irreversível (login é 1 clique via
  GitHub OAuth), então uma confirmação extra seria fricção sem ganho de segurança.

## 3. Dashboard/hub (`src/app/admin/page.tsx`)

### 3.1 Estrutura geral

```
Configurações do site  ← título de página, mesmo padrão de /admin/projects e /admin/settings
Escolha uma área para gerenciar.  ← subtítulo opcional, 1 linha, text-muted

┌─────────────────────────┐  ┌─────────────────────────┐
│ Projetos                │  │ Configurações            │
│ Criar, editar e         │  │ Editar conteúdo da       │
│ organizar os projetos   │  │ página Sobre e demais    │
│ do portfólio.           │  │ textos do site.          │
│ 4 projetos · 37 fotos   │  │                          │
└─────────────────────────┘  └─────────────────────────┘
```

- Título de página: `<h1 className="text-2xl font-semibold tracking-tight">Admin</h1>` —
  mesmo padrão de `/admin/projects` e `/admin/settings` (consistência já estabelecida no
  código atual, ver `src/app/admin/projects/page.tsx:16`).
- Subtítulo opcional de 1 linha (`text-muted text-sm`) contextualizando a tela — "Escolha
  uma área para gerenciar." Não obrigatório, mas recomendado: reforça o princípio de
  "escolha por onde começar" mesmo para quem chega direto em `/admin` sem contexto.
- Container: `mx-auto max-w-2xl px-4 py-16` (mesmo padrão de `/admin/projects` e
  `/admin/settings`, ver arquivos citados) para manter a largura de leitura consistente
  entre todas as telas do admin — **não** usar `max-w-4xl`/full-width só porque há cards
  lado a lado; 2 colunas cabem confortavelmente em `max-w-2xl` (ver 3.3).

### 3.2 Cards — quantidade e conteúdo

Exatamente **2 cards** nesta etapa, um por área de gestão definida no ADR-0006:

1. **Projetos** → `href="/admin/projects"`
   - Título: "Projetos"
   - Descrição (1–2 linhas, `text-sm text-muted`): "Criar, editar e organizar os projetos
     do portfólio."
   - Contagem opcional (enhancement, não bloqueante): "N projetos · M fotos" — se
     implementado, é uma segunda linha discreta (`text-xs text-muted`), calculada via
     `count()` simples no Server Component (`src/app/admin/page.tsx`), sem exigir nova
     tabela/agregação — reaproveita as mesmas queries que `/admin/projects` já faz. Se
     `@frontend` julgar custo/complexidade desproporcional ao ganho para esta rodada,
     **pode omitir** sem prejuízo — não é critério de aceite obrigatório.
2. **Configurações** → `href="/admin/settings"`
   - Título: "Configurações"
   - Descrição: "Editar o conteúdo da página Sobre e demais textos do site."
   - Sem contagem (não se aplica).

Não incluir um terceiro card "Fotos" avulso: fotos só existem dentro de um projeto
(hierarquia definida no ADR-0006 — `/admin/projects/[projectId]/fotos`), então o caminho
correto é sempre via card "Projetos" → lista de projetos → "Gerenciar fotos" por projeto
(nav de 2 níveis já existente em `admin/projects/page.tsx`). Adicionar um atalho direto
para fotos no hub sem projeto selecionado reintroduziria a ambiguidade que o ADR-0006
elimina.

**Sem ícone decorativo obrigatório.** Se `@frontend` optar por adicionar um ícone (ex.:
`lucide-react`, já compatível com shadcn/ui) por card, ele deve ser puramente
complementar ao texto (título+descrição já comunicam a área sozinhos) — nunca a única
pista visual, e sempre com `aria-hidden="true"` (o link já tem texto acessível via
título/descrição).

### 3.3 Layout dos cards

- Grid: `grid grid-cols-1 sm:grid-cols-2 gap-4` — 1 coluna em mobile, 2 em ≥640px. Não
  precisa de mais breakpoints: com apenas 2 cards, 2 colunas já é o máximo útil mesmo em
  desktop largo (evitar cards esticados horizontalmente sem conteúdo para preencher).
- Cada card é um único elemento `<Link>` clicável (área de toque = card inteiro, não só o
  título) — `block rounded-md border border-border p-4 sm:p-5` (mesmo raio/borda dos
  demais elementos do admin, ver `admin/projects/page.tsx:25`).
- Hover/focus: `hover:border-accent hover:bg-surface` (ou equivalente sutil — sem sombra,
  consistente com "M0 — Raio e elevação": sombra reservada a overlays/lightbox, não a
  cards). Estado de foco pelo teclado usa o mesmo anel definido em "Estados de foco" (M0):
  `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`.
- Hierarquia interna do card: título `text-base font-medium text-foreground`; descrição
  `text-sm text-muted mt-1`; contagem (se presente) `text-xs text-muted mt-2`.

### 3.4 Estados

- **Loading**: como as páginas do admin já usam `export const dynamic = "force-dynamic"`
  com fetch direto no Server Component (sem client-side loading state, ver
  `admin/projects/page.tsx`, `admin/settings/page.tsx`), o hub em si **não precisa de
  skeleton** para os 2 cards estáticos (título/descrição são hardcoded, não dependem de
  dado assíncrono). Skeleton só é necessário **se** a contagem opcional (3.2) for
  implementada e a query puder demorar perceptivelmente — nesse caso, usar
  `<Suspense fallback={...}>` isolando só a contagem (ex.: `text-xs text-muted` com um
  placeholder `"—"` ou barra pulsante curta), nunca bloqueando a renderização dos cards em
  si (título/descrição/link devem aparecer imediatamente).
- **Vazio**: não se aplica ao hub — os 2 cards são sempre exibidos (são links estruturais,
  não uma listagem de dados). O estado "nenhum projeto ainda" já existe e é tratado em
  `/admin/projects` (`admin/projects/page.tsx:21-23`, "Nenhum projeto criado ainda.") — não
  duplicar essa mensagem no hub.
- **Erro**: falha ao calcular a contagem opcional (3.2) não deve quebrar a página — se
  implementada, envolver a query em try/catch (ou deixar a query falhar isoladamente
  dentro do `Suspense`/`error.tsx` local) e, em caso de erro, omitir a contagem
  silenciosamente (card continua funcional sem o dado) em vez de mostrar mensagem de erro
  num elemento tão secundário.

## 4. Acessibilidade (WCAG 2.1 AA aplicado a esta tela)

- **Contraste**: reutiliza os tokens já verificados em `docs/design/guidelines.md` (M0) —
  `foreground`/`background` ≈17.5:1, `muted`/`background` ≈4.6:1 (AA, válido para
  `text-sm`/`text-xs` usados nas descrições dos cards — não usar `muted` abaixo de
  `text-xs`). Nenhum token novo introduzido por esta tela.
- **Alvo de toque**: itens de nav (desktop e mobile) e cards do dashboard ≥ 44×44px.
  Botão de toggle do menu mobile idem.
- **Ordem de foco**: segue DOM order — rótulo "Admin" (não focável, é texto), itens de nav
  em ordem fixa (Dashboard → Projetos → Configurações), Sair, depois conteúdo da página
  (título do hub, depois os 2 cards em ordem visual esquerda→direita). Nenhum uso de
  `tabindex` positivo.
- **Foco visível**: todo elemento interativo (itens de nav, botão de toggle mobile, botão
  Sair, cards do hub) usa o anel de foco padrão definido em M0 — nunca `outline: none` sem
  substituto.
- **ARIA**:
  - Nav: `<nav aria-label="Navegação administrativa">` envolvendo os itens (distingue de
    outras `<nav>` que possam existir na página, embora hoje não haja outra).
  - Item ativo: `aria-current="page"` (ver 2.3), não apenas classe de cor.
  - Botão de menu mobile: `aria-expanded={open}` e `aria-controls="admin-nav-menu"`
    apontando para o `id` do painel colapsável; painel com `id="admin-nav-menu"`.
  - Cards do hub: `<Link>` com texto visível suficiente (título + descrição já formam o
    nome acessível via conteúdo textual do próprio link — não precisa de `aria-label`
    redundante, desde que título e descrição estejam dentro do próprio `<a>`).
- **Não depender só de cor**: estado ativo de nav usa cor **+** sublinhado/borda (ver
  2.3); nenhum outro estado desta tela depende exclusivamente de cor.
- **Skip link**: fora do escopo desta tela (não é regressão introduzida aqui), mas
  registrar como débito a avaliar por `@ux-designer`/`@frontend` em rodada futura: se o
  admin ganhar mais telas com nav+conteúdo longo, um "Pular para o conteúdo" no topo do
  `layout.tsx` passa a valer a pena.

## 5. Critérios de aceite (visual/UX, para `@reviewer` e `@qa`)

- [ ] Nav aparece em todas as rotas `/admin/*` exceto `/admin/login`, com os 3 itens na
      ordem Dashboard → Projetos → Configurações, mais Sair.
- [ ] Item de nav correspondente à rota atual (incluindo sub-rotas de Projetos) está
      marcado como ativo visualmente **e** via `aria-current="page"`.
- [ ] Em viewport < 768px, nav colapsa em menu com toggle acessível por teclado; Sair
      permanece sempre visível fora do menu colapsado.
- [ ] `/admin` exibe exatamente 2 cards (Projetos, Configurações), cada um com título +
      descrição de 1–2 linhas, link cobrindo o card inteiro, `href` correto.
- [ ] Todos os elementos interativos (itens de nav, toggle mobile, Sair, cards) têm anel de
      foco visível ao navegar por teclado e alvo de toque ≥ 44×44px.
- [ ] Nenhum novo token de cor/tipografia/raio introduzido fora dos já definidos em
      `docs/design/guidelines.md` (M0).
- [ ] Se a contagem de projetos/fotos for implementada, sua ausência/erro não quebra a
      renderização dos cards.
