# Especificação de layout — Dashboard e navegação admin

Owner: `@ux-designer`. Consumido por `@frontend` na implementação de ADR-0006
(`docs/ADR/0006-admin-dashboard-navigation.md`) e, a partir de §6, de ADR-0007
(`docs/ADR/0007-home-featured-project-setting.md`). Escopo: `src/app/admin/layout.tsx`,
`src/components/admin/admin-nav.tsx`, `src/app/admin/page.tsx`,
`src/app/admin/settings/page.tsx`, `src/app/admin/settings/settings-form.tsx`,
`src/app/admin/settings/actions.ts`.

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
   - Descrição (atualizada — ver `docs/ADR/0007-home-featured-project-setting.md`): "Editar
     o conteúdo da página Sobre, o projeto em destaque da Home e demais configurações do
     site." Ajuste puramente textual — não muda contagem/layout do card em si (ver 3.3).
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

## 5. Destaque da Home (`/admin/settings`, extensão)

Owner: `@ux-designer`. Escopo: `src/app/admin/settings/page.tsx`,
`src/app/admin/settings/settings-form.tsx` (ou um novo componente irmão, ver 6.3),
`src/app/admin/settings/actions.ts` (reaproveitada, sem mudança de assinatura).
Consumido por `@frontend` a partir de `docs/ADR/0007-home-featured-project-setting.md`, que
já validou o modelo de dados (`site_settings`, chave `home.featuredProjectId`, zero
migration) e a decisão de não criar um 3º card no hub (`ADR-0006` permanece válido). Este
documento especifica só a camada visual/interação sobre essa decisão já fechada.

**Tom desta tela: utilitário, igual ao resto do admin** — não usa Fraunces, não usa a
camada Label (uppercase tracked) do redesign do site público
(`docs/design/public-site-redesign.md`), não usa `rounded-none`. Reaproveita exatamente o
vocabulário visual já em uso em `settings-form.tsx` (label `text-sm font-medium`, campo
`border-border rounded-md border px-3 py-2 text-sm`, botão `bg-accent text-accent-foreground
rounded-md px-4 py-2 text-sm font-medium`). Admin é ferramenta de gestão, não vitrine — regra
já estabelecida em `guidelines.md` e reafirmada aqui.

### 5.1 Posição na página

`/admin/settings` passa a ter duas seções independentes, cada uma com seu próprio
`<form>`/estado de submit (confirma o ADR: "dois blocos independentes, mesma action"):

```
Configurações do site                              ← h1, inalterado

Sobre Mim                                           ← seção existente, inalterada
[textarea]
[Salvar]

──────────────────────────────────────────────      ← divisor
Destaque da Home                                    ← nova seção
Escolha qual projeto aparece em destaque na
página inicial. "Automático" usa o primeiro
projeto pela ordem de exibição.

[preview 64×48]  [select: Automático (ordem de exibição) ▾]

[Salvar]
```

- Ordem: "Sobre Mim" primeiro (é a seção já existente, não há motivo para reordenar e gerar
  um diff visual maior que o necessário), "Destaque da Home" depois, separadas por
  `border-t border-border pt-6 mt-2` (ou equivalente) dentro do mesmo `<main
  className="mx-auto flex max-w-2xl flex-col gap-6 ...">` já existente — **não** muda o
  `max-w-2xl` da página (consistência com o resto do admin, `admin-dashboard.md` §3.1).
- Título da seção: `<h2 className="text-lg font-medium">Destaque da Home</h2>` — um nível
  abaixo do `<h1>` da página, mesmo padrão de hierarquia já usado noutras telas admin.
- Texto de apoio logo abaixo do `<h2>`: `text-sm text-muted`, 1–2 linhas, explicando o
  comportamento automático — importante porque "Automático" não é um valor óbvio por si só
  (o operador precisa saber que existe um fallback, não que ficará "sem destaque").

### 5.2 Controle — select + preview

- **Select** (`<select>` nativo, não um combobox custom — não há necessidade de busca/filtro
  com o volume de projetos esperado neste produto; nativo já dá acessibilidade de teclado de
  graça): primeira opção sempre `"Automático (ordem de exibição)"` com `value=""`; demais
  opções, uma por projeto **publicado** (todos os projetos existentes — não há conceito de
  rascunho/publicado neste schema, então "todos os projetos" é a lista completa), no formato
  `"{título} (/{slug})"` — o slug ajuda a desambiguar projetos com títulos parecidos, mesmo
  padrão informativo já usado em breadcrumbs/URLs no admin. Ordenados pela mesma ordem do
  grid público (`displayOrder`), para o operador reconhecer a posição que já conhece.
  - Mesmo estilo de campo já usado em `settings-form.tsx`:
    `border-border rounded-md border px-3 py-2 text-sm`, mínimo `h-10` (alvo de toque
    ≥44px combinado com a área clicável do label acima).
  - `<label htmlFor="featured-project" className="text-sm font-medium">Projeto em
    destaque</label>` — texto do label não repete "Destaque da Home" (já é o título da
    seção); só nomeia o campo.
- **Preview**: uma miniatura pequena (`w-16 h-12`, `object-cover`, `rounded-md border
  border-border` — raio normal de UI do admin, não a regra `rounded-none` do site público)
  da foto de capa do projeto atualmente selecionado no `<select>`, ao lado dele
  (`flex items-center gap-3`). Objetivo: confirmação visual rápida de qual foto vai para o
  hero, sem precisar abrir o projeto em outra aba.
  - Ao trocar a seleção, a preview atualiza **client-side** a partir de um mapa
    `Record<projectId, { storageKey, blurDataUrl, width, height } | null>` recebido como
    prop do Server Component (`page.tsx` já teria essa informação disponível reaproveitando
    a mesma query que a Home pública faz para capas — não precisa de nova query dedicada,
    só passar os dados já buscados adiante). **Não** faz fetch adicional ao trocar o select.
  - Quando a opção selecionada é `"Automático"`: a preview mostra a capa do projeto que
    **seria** o destaque automático hoje (primeiro por `displayOrder`), com um rótulo
    pequeno abaixo/ao lado (`text-xs text-muted`, ex. "Atual: {título do projeto}") — dá ao
    operador a mesma confirmação que teria escolhendo manualmente, sem exigir que ele saiba
    de cor qual projeto está em primeiro na ordem.
  - Quando o projeto selecionado (manual ou automático) **não tem foto de capa ainda**
    (projeto vazio, sem fotos): a preview vira um placeholder textual, mesmo padrão já usado
    no grid público (`project-grid.tsx`: "Sem fotos ainda") — `w-16 h-12 border-border
    bg-surface flex items-center justify-center rounded-md border text-[10px] text-muted`
    com o texto "Sem foto".
- **0 projetos cadastrados**: a seção ainda renderiza (não esconder — o operador precisa
  entender por que não consegue configurar nada), mas o `<select>` fica `disabled`, contendo
  só a opção "Automático (ordem de exibição)", e o texto de apoio (6.1) é substituído por:
  "Nenhum projeto cadastrado ainda — crie um projeto em Projetos para poder destacá-lo
  aqui." (sem link direto obrigatório, mas `@frontend` pode linkar para `/admin/projects` se
  achar de baixo custo).

### 5.3 Submissão e feedback

- Reaproveita `updateSiteSetting` (`src/app/admin/settings/actions.ts`) sem mudança de
  assinatura: `updateSiteSetting({ key: "home.featuredProjectId", value: { projectId:
  selected || null }, locale: "pt-BR" })` — `value` já é `jsonb`, aceita objeto (mesmo
  mecanismo de `about.content`, que hoje guarda uma string; o tipo de `value` no schema já é
  genérico o bastante, confirmar com `@backend` na implementação se o parse/validação em
  `lib/validations/site-settings.ts` precisa de um schema Zod específico para este formato —
  fora do escopo visual desta spec, é ajuste de validação de payload).
  - **Correção de escopo do action existente:** `revalidatePath` hoje chama
    `revalidatePath("/admin/settings")` e `revalidatePath("/sobre")` — para a nova chave,
    também precisa `revalidatePath("/")` (a Home pública lê `home.featuredProjectId`).
    `@backend` ajusta isso na implementação (pode ser condicional à `key`, ou simplesmente
    revalidar as três rotas sempre — mais simples, custo desprezível).
- Estado de loading/sucesso/erro: **mesmo padrão já usado em `settings-form.tsx`** — texto
  "Salvando…" no botão durante `isPending`, mensagem de sucesso (`text-sm` verde, "Salvo com
  sucesso.") ou erro (`text-danger text-sm`) abaixo do form, independente do form de "Sobre
  Mim" (cada seção tem seu próprio estado local, evita um erro no form de Sobre invalidar
  visualmente o form de Destaque da Home e vice-versa — já é a mesma independência que o ADR
  pede na camada de dados).
- Sem confirmação/modal antes de salvar — trocar o destaque da Home não é uma ação
  destrutiva/irreversível (pode ser trocado de volta a qualquer momento, inclusive para
  "Automático"), então uma confirmação extra seria fricção sem ganho, mesmo raciocínio já
  aplicado ao logout do admin (`admin-dashboard.md` §2.5).

### 5.4 Acessibilidade

- `<select>` com `<label htmlFor>` associado (não `aria-label` solto) — mesma regra já
  aplicada a `about-content`/`textarea` em `settings-form.tsx`.
- Preview (`<img>`/`next/image`) tem `alt` descritivo (ex. `alt={"Capa de " + tituloDoProjeto}`
  quando há foto; quando é placeholder "Sem foto", o container não é uma imagem, é texto —
  não precisa de `alt` vazio nem `aria-hidden`, o próprio texto já é o conteúdo acessível.
- Foco visível no `<select>` e no botão "Salvar" — anel padrão já definido em
  `guidelines.md` M0 ("Estados de foco"), nenhum novo token.
- Alvo de toque do `<select>` e do botão ≥44×44px (já garantido pelo padding/altura mínima
  especificados em 6.2).
- Mensagens de sucesso/erro (6.3) não dependem só de cor — sempre acompanhadas de texto
  (já é o padrão de `settings-form.tsx`, mantido aqui).

## 6. Critérios de aceite (visual/UX, para `@reviewer` e `@qa`)

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
- [ ] `/admin/settings` exibe a seção "Destaque da Home" (§5) abaixo da seção "Sobre Mim"
      existente, cada uma com seu próprio estado de submit/feedback independente.
- [ ] `<select>` de projeto em destaque tem "Automático (ordem de exibição)" como primeira
      opção (`value=""`), demais opções listando todos os projetos no formato
      "{título} (/{slug})", ordenados por `displayOrder`.
- [ ] Preview de 64×48 ao lado do select reflete a capa do projeto atualmente selecionado
      (inclusive quando "Automático" está selecionado, mostrando a capa do projeto que seria
      escolhido automaticamente hoje) sem fazer nova requisição de rede ao trocar a seleção.
- [ ] Projeto sem foto de capa exibe placeholder textual "Sem foto" no lugar da preview, sem
      quebrar o formulário.
- [ ] Com 0 projetos cadastrados, o `<select>` fica desabilitado com texto explicando o
      motivo, em vez de esconder a seção inteira.
- [ ] Salvar "Destaque da Home" não afeta o estado/mensagem de sucesso-erro da seção
      "Sobre Mim" e vice-versa.
- [ ] `<select>` e botão "Salvar" desta seção têm `<label htmlFor>` associado, anel de foco
      visível e alvo de toque ≥44×44px — nenhum token novo de cor/tipografia/raio
      introduzido (reaproveita exatamente o vocabulário visual já usado em
      `settings-form.tsx`, sem tratamento fine-art do site público).
