# Redesign fine-art do site público

Owner: `@ux-designer`. Consumido por `@frontend`. Escopo: `src/app/(public)/**`,
`src/components/gallery/*`, `src/components/site-header.tsx` (a ser substituído — ver §4),
`src/app/layout.tsx`, `src/app/globals.css`. **Não altera** `src/app/admin/**` (o admin
mantém a estética utilitária já especificada em `docs/design/admin-dashboard.md` — ver §9).

Este documento complementa `docs/design/guidelines.md` (M0), que já foi atualizado com os
tokens que mudam por causa desta spec (tipografia, raio). Aqui está o "porquê" e o
detalhamento de layout/interação.

**Status: versão final**, fechada em 23/08/2026 após avaliação de 3 referências trazidas
pelo dono do site (ver §2). Não há rodada de referência pendente — próximo passo é o
mockup para aprovação do usuário e, para a mudança de navegação (§4), validação de
`@arquiteto` antes de `@frontend` implementar em produção.

## 1. Diagnóstico do estado atual

Lido em `src/app/(public)/page.tsx`, `src/app/(public)/projetos/[slug]/page.tsx`,
`src/components/gallery/project-grid.tsx`, `photo-gallery.tsx`, `site-header.tsx`. Três
problemas concretos, não "está feio":

1. **Tudo é a mesma voz tipográfica.** Wordmark do header (`text-sm font-semibold`), H1 da
   Home (`text-3xl sm:text-4xl font-semibold`), título de card (`text-sm font-medium`) e
   título de projeto (`text-2xl sm:text-3xl font-semibold`) usam a mesma família (Geist
   Sans) na mesma lógica de peso/tracking — a hierarquia existe só por tamanho. Isso lê como
   "site institucional bem organizado", não como "galeria autoral".
2. **Fotos tratadas como thumbnails de produto.** `project-grid.tsx:28` e
   `photo-gallery.tsx:77` colocam toda foto dentro de `border border-border rounded-md`,
   proporção forçada (`aspect-[4/3]`, `aspect-square`) independente da composição real do
   fotógrafo. Border + cantos arredondados + crop forçado é o vocabulário visual de
   e-commerce/dashboard, não de galeria.
3. **Não há "momento de entrada".** A Home vai direto de um H1 centralizado genérico para um
   grid uniforme — não existe uma abertura editorial antes do índice de projetos, nem
   respiro entre título/descrição e o grid na página de projeto.

## 2. Referências avaliadas e decisões fechadas

O dono do site pediu explicitamente para extrair "o que há de melhor" de 3 referências.
Nenhuma foi adotada por inteiro — cada uma contribuiu para uma decisão específica.

| Referência | O que mostra (relevante a esta spec) |
|---|---|
| **brunononogaki.com** (fotógrafo de paisagem) | Hero 100vh full-bleed com scrim escuro e nome/título **sobrepostos** à foto; grid "Galerias" com cards quase full-bleed, gradiente no terço inferior, legenda sobreposta (local/ano + título). Header transparente flutuando sobre a hero, nav horizontal em caps tracked. |
| **46graus.com/rodrigojeronimodossantos** (portfólio atual do próprio dono do site — o mais relevante: é a identidade com a qual ele já se reconhece) | **Sidebar fixa à esquerda** (não header no topo): nome tratado em dois pesos ("Rodrigo" bold + "Jerônimo · Photographer" leve, mesma família sans), nav vertical (Início/Portfólio/Sobre/Contato, uppercase tracked, item ativo sublinhado), ícones sociais. Área de conteúdo: **uma foto grande, full-bleed, sem nenhum texto sobreposto** — "a foto respira sozinha" — com seta de scroll no canto. |
| **alerodrigues.com** (citada anteriormente só para o hub do admin, `docs/design/admin-dashboard.md`) | Navegação por cards descritivos — já incorporada no admin, não é referência de estética do site público; mencionada aqui apenas para não confundir com as duas acima. |

### 2.1 Texto sobreposto à foto (scrim) — decisão: **não adotar**

Das duas referências efetivamente concorrentes nesta decisão, a que pesa mais é o portfólio
atual do próprio dono (é a identidade dele, não uma referência genérica de mercado) — e ela
evita overlay de propósito ("a foto respira sozinha"). Nonogaki usa overlay, mas é a exceção,
não a maioria, e overlay reintroduz um risco que a spec original já queria evitar: texto
sobre foto exige um tratamento de contraste (scrim) que, mesmo tecnicamente resolvível,
adiciona uma variável a mais (opacidade mínima do gradiente, testada foto a foto) para um
ganho estético que a referência mais alinhada à identidade do dono não usa.

**Regra final, sem exceção: nenhum texto é renderizado sobre pixels de foto em nenhuma tela
do site público** — nem no hero da Home, nem nos cards do grid, nem nas thumbnails de
projeto, nem no lightbox. Toda legenda/título vive **fora** da área da imagem (abaixo, ao
lado, ou numa sidebar). Isso também simplifica a implementação (nenhum gradiente/scrim para
calibrar, nenhum novo token de cor "para uso sobre foto") e elimina de vez o risco de
contraste variável por foto — mantém a heurística "a foto é o produto" (`guidelines.md`
princípio 1) da forma mais literal possível.

Isso **reverte e substitui** qualquer leitura anterior deste documento que sugerisse scrim —
esta é a versão final.

### 2.1.1 Adenda (23/08/2026) — sidebar translúcida/"vazando" atrás da imagem: avaliado e recusado; alternativa adotada

O dono do site, vendo o mockup, pediu se a sidebar pode ficar "levemente transparente" para
dar mais presença à imagem, deixando o conteúdo full-bleed passar visualmente por trás da
coluna da sidebar em vez de uma coluna sólida de `17rem` que a empurra. Avaliei as duas
perguntas que isso levanta — (a) existe uma versão tecnicamente segura de nav translúcido
sobre foto? (b) dá pra resolver a dor real (imagem confinada) sem tocar a decisão de §2.1?

**(a) Nav translúcido/glass sobre foto — recusado como tratamento padrão.** Fiz as contas:
com `backdrop-blur` + `bg-background/α`, como o token `--color-background` já é quase
branco (L≈0.96, tema claro) ou quase preto (tema escuro), mesmo uma opacidade moderada
(`α` ~0.3–0.4) já garante AA contra a maioria dos tons de foto plausíveis, matematicamente
— então "existe uma versão segura" na teoria. Mas rejeito adotar isso como tratamento padrão
por um motivo operacional, não só estético: **o admin permite upload de fotos novas sem
deploy e sem revisão de design** (`.claude/CLAUDE.md`: "módulo administrativo... upload de
fotos... sem novo deploy"). Um painel de nav translúcido depende do conteúdo de *cada nova
foto que o dono subir no futuro* para continuar legível — uma foto com uma área de alto
contraste local exatamente atrás de uma letra do nav (ex. um ponto de luz forte numa cena
de floresta escura) pode furar o cálculo médio mesmo com blur, e ninguém vai testar isso a
cada upload. Isso é exatamente o risco que §2.1 já descartou para legendas — aqui é pior,
porque nav é elemento persistente e funcional (não uma legenda secundária), então a barra de
exigência de confiabilidade é mais alta, não mais baixa. **Decisão: não adotar nav
translúcido/glass em lugar nenhum do site.**

**(b) Resolver a dor real sem reabrir §2.1 — adotado.** O pedido de fundo não é
"transparência" por si — é "a imagem não deveria parecer confinada por uma coluna sólida".
Isso é resolvível sem tocar nav nenhum: **a foto de capa do hero da Home (§5.1) passa a se
estender visualmente por trás da faixa da sidebar** (full-bleed até a borda esquerda real da
viewport), enquanto a **sidebar continua 100% opaca**, sobreposta por cima dessa faixa da
foto só naquela seção — ou seja, é a *imagem* que "vaza" para trás da coluna, não o nav que
fica translúcido sobre ela. Do ponto de vista do usuário o efeito visual pedido (a foto
"maior", menos confinada) é entregue; do ponto de vista de §2.1 nada muda — nenhum pixel de
texto se torna visível sobre foto, porque a sidebar continua sólida (sem transparência) onde
quer que esteja posicionada. Detalhado em §4.1 e §5.1.

Esse tratamento é **restrito à seção do hero** — não se aplica ao grid de projetos abaixo
nem a nenhuma outra tela: um grid tem várias fotos discretas lado a lado, e deixá-las
"vazarem" atrás da sidebar cortaria a coluna mais à esquerda do grid (perda de conteúdo
visível), diferente do hero (uma única foto grande, onde perder ~272px na borda esquerda
por trás de um painel opaco é visualmente irrelevante — é o mesmo raciocínio de letterboxing
de UI sobre uma imagem cinematográfica). Fora do hero, a sidebar volta a ser uma coluna real
reservando espaço no fluxo do documento (como já especificado em §4.1), nunca sobreposta a
conteúdo.

**Resposta à pergunta "isso é opcional ou substitui a decisão atual?"**: substitui — não é
uma variante que depende de aprovação visual do dono entre duas opções. O tratamento
"hero full-bleed sob sidebar opaca" estritamente melhora o objetivo pedido (mais presença de
imagem) sem nenhuma contrapartida de risco de contraste ou de complexidade relevante (é uma
técnica CSS conhecida, escopada a um único componente) — não faz sentido oferecer a versão
"hero confinado à coluna" como alternativa formal quando a full-bleed é estritamente melhor
e igualmente segura. Passa a ser o tratamento padrão do hero, já refletido em §5.1.

### 2.2 Navegação: sidebar fixa vs. header horizontal — decisão: **recomendar migração para sidebar, condicionada à validação de `@arquiteto`**

Recomendo adotar a sidebar fixa à esquerda, pelos motivos:

- É a identidade com a qual o próprio dono do site **já se reconhece** — sinal mais forte
  que qualquer referência de mercado (Nonogaki) ou heurística genérica de UX.
- Resolve elegantemente a decisão §2.1: a sidebar dá um lugar natural e permanente para
  nome/identidade e navegação, sem precisar disputar espaço com a foto — a foto na área de
  conteúdo fica livre de qualquer texto.
- Funciona bem com o padrão "uma foto grande por vez" que já é o tom do site (hero da Home,
  grid denso de projeto).

**Mas isso é uma mudança estrutural, não só visual** — `SiteHeader` é hoje renderizado uma
única vez em `src/app/(public)/layout.tsx`, compartilhado por todas as rotas públicas
(confirmado lendo o arquivo). Substituí-lo por uma sidebar muda o layout de toda página
pública (largura da coluna de conteúdo, pontos de quebra do grid, estratégia de colapso
mobile) — isso é "impacto estrutural relevante" pela própria regra de orquestração do
projeto (`.claude/CLAUDE.md`: "Toda feature nova começa com `@arquiteto` validando impacto
estrutural"). **Não é uma mudança de dados/infra** (não tem ADR de banco/storage
envolvido), então a validação de `@arquiteto` deve ser leve/confirmatória — mas não deve ser
pulada. Meu papel aqui é especificar a camada visual/interação (§4) para que, aprovada a
estrutura, `@frontend` implemente direto a partir desta spec.

**Fallback caso não aprovado:** manter o header horizontal atual (`site-header.tsx`
inalterado em estrutura), aplicando ainda assim o tratamento de wordmark em dois pesos
(§2.3) — essa parte da decisão é independente e barata, não depende da sidebar ser aprovada.

**O mockup para aprovação do usuário pode e deve mostrar a versão com sidebar** (é a
direção recomendada) — a validação de `@arquiteto` é um gate para a *implementação em
produção* (PR), não para gerar o mockup de aprovação visual.

### 2.3 Wordmark em dois pesos — decisão: **adotar, independente da decisão de navegação**

Tratamento barato (não muda arquitetura) e com identidade já validada pelo próprio dono:
nome em dois pesos, mesma família sans (Geist Sans — **não** Fraunces; ver §3.2, o wordmark é
marca/nav, não título editorial de conteúdo). Detalhado em §4.2 (sidebar) e §4.5 (fallback
header).

## 3. Tipografia

### 3.1 Segunda família: Fraunces (serifada de exibição)

O problema da Home/projeto não é só escala/peso — é a ausência de uma voz contemplativa.
Geist Sans é uma fonte de interface excelente, mas não carrega nenhuma associação com
tipografia editorial/fotografia autoral. **Família escolhida: Fraunces**
(`next/font/google`, pesos `400`/`500`, estilos `normal`/`italic`) — serifa de exibição
desenhada para telas grandes (diferente de uma serifa de livro tipo Georgia), com presença
em `text-6xl`+ sem ficar "vitoriana" (evita o efeito Playfair Display/convite de casamento,
fora do tom "natureza contemplativa" do portfólio). Self-hosted automaticamente via
`next/font` (mesmo padrão de `Geist`/`Geist_Mono` já em `src/app/layout.tsx`), sem
requisição externa em runtime, `font-display: swap` por padrão.

```ts
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
```

Em `src/app/globals.css`, dentro de `@theme inline`: `--font-serif: var(--font-fraunces);`
— cria o utilitário Tailwind `font-serif`.

### 3.2 Regra de uso — mapa por elemento

| Elemento | Família | Peso/estilo |
|---|---|---|
| **Wordmark** (nome do fotógrafo, sidebar ou header — §4) | Geist Sans | 700 (nome) + 400 (sobrenome/papel) — ver §4.2 |
| H1 da Home (bloco de destaque, §5.1) | Fraunces | 400 |
| Título do card em destaque (hero da Home) | Fraunces | 500 |
| Legenda de título nos cards do grid (`project-grid.tsx`) | Fraunces | 400 |
| H1 de página de projeto | Fraunces | 400 |
| Descrição de projeto (nota curatorial, §6) | Fraunces | 400 *italic* |
| H1 de Sobre | Fraunces | 400 |
| **Tudo o mais** — nav (sidebar/header), breadcrumb, botões, labels/eyebrows, corpo de
  texto, formulário de contato, **toda a área `/admin`** | Geist Sans | conforme já definido em `guidelines.md` M0 |

Nenhum uso de Fraunces abaixo de `text-lg`. Nenhum uso de `tracking-tight` em Fraunces (a
serifa já é compacta em corpo grande; `tracking-tight` distorce as curvas). Nenhum peso
Fraunces ≥ 600 em nenhum elemento — diferente de uma versão anterior deste documento, **não
há mais exceção para texto sobre foto**, porque não existe mais texto sobre foto (§2.1).

O wordmark usa Geist Sans — não é uma "título editorial de conteúdo", é marca pessoal/nav, e
a regra já estabelecida em `guidelines.md` ("Fraunces nunca em UI/nav") já cobre isso sem
precisar de exceção.

### 3.3 Micro-detalhes tipográficos (Vercel Web Interface Guidelines)

- Aspas curvas (`"…"`) em texto editorial vindo de conteúdo (descrição de projeto, texto de
  Sobre) — se o conteúdo vier de campo de formulário livre (`siteSettings`,
  `project.description`), normalização automática está fora de escopo desta spec (registrar
  como débito para `@backend`/`@arquiteto` avaliar no editor de Sobre).
- Reticências como caractere único `…` em qualquer texto estático de UI introduzido por esta
  spec (ex.: "Carregando…").
- `font-variant-numeric: tabular-nums` em qualquer número alinhado: contador do lightbox
  ("01 / 12"), índice numérico dos cards do grid ("01", "02"...).

## 4. Navegação — sidebar (`src/components/site-sidebar.tsx`, novo componente)

Substitui `src/components/site-header.tsx` **se** `@arquiteto` validar a mudança estrutural
(§2.2). Renderizada uma vez em `src/app/(public)/layout.tsx`, mesmo ponto onde
`<SiteHeader />` está hoje.

### 4.1 Estrutura geral (desktop, ≥ `lg` / 1024px)

```
┌──────────────┬──────────────────────────────────────┐
│ Rodrigo       │                                       │
│ Jerônimo ·    │                                       │
│ Fotógrafo     │         ÁREA DE CONTEÚDO              │
│               │   (hero, grid, projeto, sobre...)     │
│ INÍCIO ▔▔▔▔  │                                       │
│ SOBRE         │                                       │
│ CONTATO       │                                       │
│               │                                       │
└──────────────┴──────────────────────────────────────┘
```

- Layout via flexbox em `(public)/layout.tsx`: `lg:flex`, sidebar `lg:w-[17rem] lg:shrink-0
  lg:sticky lg:top-0 lg:h-dvh`, conteúdo `flex-1 min-w-0`. Abaixo de `lg`, layout normal em
  coluna (sidebar vira barra superior, ver §4.4).
- Fundo da sidebar: **sempre 100% opaco**, `bg-background` (mesmo tom "papel" do resto do
  site — **não** preto como Nonogaki; o portfólio de referência do próprio dono também usa
  fundo claro na sidebar). Nunca `bg-background/<opacidade>` nem `backdrop-blur` — decisão
  fechada em §2.1.1 (nav translúcido sobre foto avaliado e recusado). Isso vale mesmo na
  seção do hero (§5.1), onde a sidebar visualmente "flutua" sobre a foto — ela continua
  opaca, é a foto que se estende por trás dela, não o contrário.
- Borda: `border-r border-border` separando sidebar do conteúdo — **exceto** na altura do
  hero da Home, onde não há borda (a sidebar ali se comporta como um painel flutuando sobre
  a foto, não como uma coluna com fundo próprio adjacente a outro fundo — uma borda ali
  cortaria visualmente a foto de forma artificial). Ver §5.1 para o detalhe de como a foto
  do hero se estende por trás da sidebar apenas nessa seção.
- Padding interno: `p-6 lg:p-8`.

### 4.2 Wordmark

- Bloco no topo da sidebar, envolvido por `<Link href="/">` (área de clique cobrindo as
  duas linhas — é o "logo" do site).
- Linha 1: primeiro nome, `font-sans font-bold text-2xl tracking-tight text-foreground`
  (ex. "Rodrigo").
- Linha 2, logo abaixo (`mt-0.5`): sobrenome + papel, mesma família,
  `font-sans font-normal text-lg text-muted` (ex. "Jerônimo · Fotógrafo") — peso leve
  contrastando com a linha 1, exatamente o padrão de identidade que o dono já usa no
  46graus. **Conteúdo exato do texto (nome completo, se leva "Fotógrafo" ou outro
  descritor) é decisão de conteúdo do dono, não desta spec** — `@frontend`/`@pm` confirmam
  a string exata antes de implementar; a estrutura (dois pesos, duas linhas) é o que está
  especificado aqui.
- Fallback (header horizontal, se sidebar não for aprovada): mesmo tratamento de dois pesos,
  numa linha só (`Rodrigo `<span class="font-normal text-muted">Jerônimo · Fotógrafo</span>`)
  para caber na largura de um header horizontal.

### 4.3 Nav vertical

- Lista vertical logo abaixo do wordmark (`mt-8 lg:mt-10`, `flex flex-col gap-1`).
- 3 itens, na ordem: **Início** (`/`), **Sobre** (`/sobre`), **Contato** (`/contato`) — não
  adiciono um 4º item "Portfólio" como no 46graus, porque neste site a Home **já é** o
  índice de projetos/galeria (ver §5) — um item "Portfólio" seria redundante com "Início"
  neste produto especificamente (diferente do 46graus, onde a Home é uma página de abertura
  separada do índice de portfólio).
- Cada item: camada Label (`text-xs uppercase tracking-[0.14em] font-medium`), `block py-2`
  (garante alvo de toque ≥44px somado ao padding do container). Item ativo: `text-accent` +
  `underline underline-offset-4` (não depender só de cor — mesma regra já usada no nav do
  admin, `docs/design/admin-dashboard.md` §2.3) + `aria-current="page"`. Ativo determinado
  por `pathname === href` (sem prefixo/sub-rota aqui — diferente do admin, as 3 rotas
  públicas não têm sub-rotas relevantes para efeito de nav ativa, exceto Início: qualquer
  rota `/projetos/*` também deve marcar "Início" como ativo, já que projeto é
  hierarquicamente parte do índice da Home).
- Ícones sociais (presentes na referência do 46graus): **não incluídos nesta rodada** — não
  há campo de dados para links sociais no schema atual (`db/schema.ts`) nem em
  `siteSettings`. Fabricar URLs de rede social sem dado real não é decisão de design válida.
  Registrado como enhancement futuro: se o dono fornecer os links, `@backend`/`@pm` avaliam
  uma chave `siteSettings` (`social.instagram`, etc.) e esta spec pode ser estendida com o
  tratamento visual (ícones simples, `aria-label` por rede, sem cor decorativa saturada —
  manter neutro/`text-muted` com `hover:text-accent`, consistente com o resto do sistema).

### 4.4 Comportamento mobile/tablet (< `lg`, < 1024px)

Reaproveita o mesmo padrão já especificado e validado para o nav mobile do admin
(`docs/design/admin-dashboard.md` §2.4) — não inventa um terceiro padrão de colapso:

- Sidebar vira barra horizontal no topo (`border-b border-border`, altura ~`h-14`/`h-16`),
  mostrando wordmark compacto (uma linha, "Rodrigo Jerônimo") + botão de toggle
  (`aria-expanded`, `aria-controls`, alvo ≥44×44px) à direita.
- Menu expandido empurra o conteúdo abaixo (não overlay) — `flex flex-col`, itens
  empilhados, cada um com `py-3` (alvo ≥44px). Fecha ao navegar ou pressionar `Esc`.
- Sem focus trap (não é modal bloqueante), ordem de tab segue DOM order.

### 4.5 Impacto no grid de projetos

Com a sidebar ocupando `17rem` fixos em `≥lg`, a largura disponível para o grid muda —
`@frontend` deve verificar visualmente se a 4ª coluna do grid (`lg:grid-cols-4`) ainda
respira bem nessa largura reduzida ou se o salto para 4 colunas deve empurrar para `xl`
(1280px) em vez de `lg` — não travo esse número aqui porque depende da largura real
disponível após o `17rem` da sidebar, é um ajuste visual de implementação, não uma regra de
design.

## 5. Home (`src/app/(public)/page.tsx`)

### 5.1 Estrutura geral

```
[Sidebar — wordmark + nav, ver §4]     ┌───────────────────────────────┐
                                        │                               │
                                        │   FOTO DE CAPA DO 1º PROJETO │
                                        │   full-bleed, object-cover   │
                                        │   (preenche a área, pode     │
                                        │    cropar — ver justificativa│
                                        │    abaixo)                   │
                                        │                          ⌄  │ ← scroll cue
                                        └───────────────────────────────┘
                                        PROJETO EM DESTAQUE   ← label
                                        Título do Projeto     ← Fraunces
                                        Descrição curta, se houver.

                                        — respiro (py-16 sm:py-24) —

                                        01 — Título do 2º projeto  02 — ...
                                        [grid dos projetos restantes]
```

- **Bloco de destaque é a capa do primeiro projeto** (`displayOrder` mais baixo), já
  vinculado a `/projetos/[slug]` — reaproveita `items[0]` já buscado hoje em `page.tsx`,
  **zero mudança de schema/query**. Evita "hero de agência" (imagem decorativa sem
  propósito): o hero é um convite de entrada real no primeiro projeto.
- **Sem texto sobreposto** (§2.1) — título/descrição sempre abaixo da foto.
- **Crop permitido no hero, especificamente aqui** (`object-cover`, preenchendo a área
  disponível da coluna de conteúdo, altura alvo `h-[70vh] sm:h-[80vh] lg:h-dvh` dentro da
  área de conteúdo) — isto é uma mudança em relação a uma versão anterior deste documento,
  que defendia `object-contain` sem crop em todo lugar. Revisão: as duas referências mais
  fortes (Nonogaki e o portfólio do próprio dono) tratam o hero como full-bleed/cover, não
  letterboxed — o hero é um teaser de entrada, não a apresentação definitiva da foto. A
  **apresentação definitiva e fiel à composição original acontece no lightbox** (§7, sempre
  `object-contain`, nunca cropado) — é lá que a fidelidade ao enquadramento do fotógrafo
  importa de fato. Essa distinção (hero = impacto, lightbox = fidelidade) é intencional e
  deve ser documentada como tal para `@reviewer`/`@qa`, não é uma inconsistência.
- **Seta de scroll** (chevron), centralizada no rodapé do hero, como âncora real
  (`<a href="#projetos-restantes">`, não só decorativa — beneficia navegação por teclado)
  com ícone `aria-hidden="true"` e texto visualmente oculto porém acessível
  ("Ver mais projetos" via `sr-only`). Animação sutil (`translateY` 0↔6px, `1.6s ease-in-out
  infinite`) **apenas** dentro de `@media (prefers-reduced-motion: no-preference)` — fora
  dessa media query o ícone fica estático (nunca começa animado e "trava" para quem pediu
  motion reduzido).
- Eyebrow "PROJETO EM DESTAQUE" — camada Label. Título Fraunces 500,
  `text-4xl sm:text-6xl lg:text-7xl`, `leading-[1.05]`, sem `tracking-tight`. Bloco de
  título é um único `<Link href="/projetos/[slug]">` (área de clique grande).
- Imagem do hero é a única com `priority`/`fetchpriority="high"` na Home (LCP element).
- Se houver só 1 projeto publicado: mostra só o bloco de destaque, sem grid abaixo. Se 0
  projetos: mantém estado vazio atual.

**Foto do hero "vazando" por trás da sidebar (adenda 23/08/2026, ver §2.1.1 e §4.1):** só
nesta seção, o contêiner da foto de capa ignora a largura reservada pela sidebar e se
estende até a borda esquerda real da viewport — ex. `lg:absolute lg:inset-y-0 lg:left-0
lg:w-screen` dentro de um wrapper `relative`, ou equivalente via `calc()`/grid — mecanismo
exato de implementação fica a critério de `@frontend`, o requisito de design é: a foto deve
visualmente ocupar toda a largura da tela nessa seção, com a sidebar sobreposta por cima
dela (não ao lado) apenas ali, **sempre 100% opaca** (nunca translúcida — decisão fechada em
§2.1.1). Sombra sutil na borda da sidebar nessa seção (`shadow-[...]` leve, para separar
visualmente o painel da foto por trás, já que não há mais `border-r` ali) — consistente com
a regra de M0 "sombra só em overlays" (`guidelines.md`), já que a sidebar está,
funcionalmente, sobrepondo a foto nesse trecho. Assim que o conteúdo desce para o grid
(§5.2), a sidebar volta ao comportamento normal de coluna reservando espaço real (sem
sobrepor nada) — o "vazamento" é exclusivo da altura do hero.

### 5.2 Grid dos projetos restantes

- Mesma estrutura de dados de hoje (`ProjectGrid`), menos o item já usado no destaque.
- Gap aumentado: `gap-6 sm:gap-8 lg:gap-10` (era `gap-4`).
- Colunas: 2 (mobile) → 3 (`sm`) → 4 (`lg`/`xl`, ver ajuste de §4.5) — **sem** grid bento
  assimétrico (o único momento assimétrico é o hero, §5.1; manter o grid uniforme evita
  acoplar a ordem dos projetos a tamanhos de célula, sem ganho de usabilidade proporcional).
- **Sem borda, sem `rounded-md`** — cantos retos (`rounded-none`), ver
  `guidelines.md` §"Raio e elevação". `aspect-[4/3]` mantido como proporção do *container*
  do grid — aceitável cropar levemente aqui (grid é índice/wayfinding, diferente do hero).
- Legenda **sempre visível, abaixo da imagem** (nunca sobreposta, §2.1): índice numérico de
  2 dígitos (`01`, `02`...) em camada Label (`tabular-nums`) + travessão + título em
  Fraunces 400, `text-lg sm:text-xl`. Estrutura semântica `<figure>`/`<figcaption>`.
- Hover/focus: leve escala da imagem (`scale-[1.03]`, container `overflow-hidden`,
  `transition-transform duration-300 ease-out`, só `transform`). Sob
  `prefers-reduced-motion: reduce`, remove a transição de escala — a legenda não depende do
  hover para ser lida (sempre visível abaixo).

## 6. Página de projeto (`src/app/(public)/projetos/[slug]/page.tsx`)

### 6.1 Estrutura

```
← Início                                    ← breadcrumb minimalista, camada Label

N FOTOGRAFIAS                                ← eyebrow, camada Label, tabular-nums
Título do Projeto                            ← Fraunces 400, text-3xl→text-6xl
“Descrição do projeto, se houver, tratada     ← Fraunces 400 italic, text-lg/xl,
 como nota curatorial.”                          max-w-2xl, leading-relaxed

— respiro (py-16 sm:py-24) antes do grid —

[grid de fotos — PhotoGallery, ver §7]
```

- Breadcrumb simplificado: "← Início" (camada Label, `text-xs uppercase
  tracking-[0.14em]`), substituindo o padrão "Início / Título" atual — o H1 logo abaixo já
  mostra o título, repetir na breadcrumb é redundante. Continua útil mesmo com a sidebar
  (§4) mostrando "Início" no nav — é um atalho contextual mais rápido, especialmente em
  mobile onde a sidebar está colapsada.
- Eyebrow "N FOTOGRAFIAS" — dado já disponível (`photos.length`), zero query nova. Omitida
  se `photos.length === 0`. Singular/plural: "1 FOTOGRAFIA" / "N FOTOGRAFIAS".
- H1 Fraunces 400, `text-3xl sm:text-5xl lg:text-6xl`, `leading-tight`, `tracking-normal`.
- Descrição como nota curatorial: Fraunces 400 itálico, `text-lg sm:text-xl`,
  `leading-relaxed`, `max-w-2xl`, `text-foreground` (não `text-muted` — é conteúdo autoral).
- Respiro `py-16 sm:py-24` entre o bloco de título/descrição e o grid de fotos (hoje é
  direto, `pt-4`).

## 7. Grid de fotos e lightbox (`photo-gallery.tsx`, `grid-skeleton.tsx`)

- Mesmas regras de §5.2 quanto a raio (`rounded-none`) e gap (`gap-6 sm:gap-8 lg:gap-10`).
  `GridSkeleton` acompanha: remove `rounded-md`, mesmo gap.
- **Sem legenda nas thumbnails do grid** (revisão em relação a uma versão anterior deste
  documento, que propunha uma faixa translúcida sobre a foto no hover) — para manter a
  regra de §2.1 sem exceção ("nenhum texto sobre pixel de foto, em lugar nenhum"), a
  thumbnail fica limpa; título/local/data (se existirem) aparecem só no lightbox, **abaixo**
  da imagem ampliada, nunca sobre ela.
- **Contador no lightbox:** "01 / 12" (camada Label, `tabular-nums`), próximo aos botões
  Anterior/Próxima. Ganho de orientação (heurística "visibilidade do status do sistema")
  sem custo relevante (`index + 1` / `photos.length`, já disponível).
- **Metadados no lightbox (recomendação, não bloqueante):** `GalleryPhoto`
  (`photo-gallery.tsx:8-15`) hoje seleciona só `id`, `title`, `storageKey`, `blurDataUrl`,
  `width`, `height` — mas o schema já tem `photo.location`/`photo.captureDate` não
  utilizados em nenhuma tela pública. Recomendo expandir `getPhotos()` para incluir esses
  campos e exibi-los como legenda abaixo da imagem no lightbox (camada Label, formato
  "Serra da Canastra · Jun 2025", omitindo o que faltar). Fica registrado para `@frontend`
  avaliar custo/benefício — não bloqueia os critérios de aceite (§10) se não entrar nesta
  rodada.
- Imagem do lightbox: `object-contain`, sempre com `width`/`height` reais da foto — nunca
  cropada (diferente do hero da Home, §5.1 — ver justificativa lá).
- **Transição de abertura/fechamento do `<dialog>`** — progressive enhancement via CSS
  `@starting-style` (Chrome/Edge 117+, Safari 17.4+; navegadores sem suporte abrem/fecham
  instantâneo, sem regressão funcional, sem JS extra):

  ```css
  dialog {
    transition:
      opacity 200ms ease-out,
      transform 200ms ease-out,
      overlay 200ms allow-discrete,
      display 200ms allow-discrete;
    opacity: 1;
    transform: scale(1);
  }
  dialog::backdrop {
    transition: opacity 200ms ease-out, overlay 200ms allow-discrete, display 200ms allow-discrete;
    opacity: 1;
  }
  @starting-style {
    dialog[open] { opacity: 0; transform: scale(0.98); }
    dialog[open]::backdrop { opacity: 0; }
  }
  dialog:not([open]) { opacity: 0; transform: scale(0.98); }

  @media (prefers-reduced-motion: reduce) {
    dialog, dialog::backdrop { transition-duration: 0.01ms; }
  }
  ```

  Só `transform`/`opacity` (nunca `transition: all`). `prefers-reduced-motion: reduce`
  reduz a duração a ~0 sem remover a regra (evita flash de conteúdo não estilizado).
- **Crossfade entre fotos ao navegar (Anterior/Próxima):** a imagem remonta via
  `key={current.id}` (`photo-gallery.tsx:114`) — fade-in simples via `animation`, definida
  **somente** dentro de `@media (prefers-reduced-motion: no-preference)` (fora dela, opacidade
  1 estática por padrão):

  ```css
  @media (prefers-reduced-motion: no-preference) {
    dialog img { animation: photo-fade-in 200ms ease-out; }
  }
  @keyframes photo-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  ```

## 8. Sobre (`src/app/(public)/sobre/page.tsx`)

Menor superfície de mudança:

- H1: Fraunces 400, `text-3xl sm:text-5xl` (era Geist Sans `font-semibold`).
- Corpo: mantém Geist Sans, `text-base leading-relaxed` — **não** trocar para serifada
  (Fraunces é fonte de exibição, não de leitura longa; regra de §3.2, nenhum uso abaixo de
  `text-lg`, e o corpo de Sobre é `text-base`).
- `max-w-2xl` mantido — já é boa medida de leitura.

## 9. Fora de escopo (confirmação explícita)

- **Admin (`src/app/admin/**`)** não muda nada — Geist Sans/Mono, `rounded-md` em tudo, sem
  camada Label/serifada, sem sidebar (nav do admin continua horizontal, ver
  `docs/design/admin-dashboard.md`). "Admin é ferramenta de gestão, não vitrine" — esta spec
  não introduz exceção.
- **Tema escuro permanente** — avaliado e descartado (§2.2): a sidebar usa o mesmo tom
  "papel" claro do resto do site (com dark mode via `prefers-color-scheme`, já existente,
  inalterado), não um rebrand para preto fixo como Nonogaki.
- **Ícones sociais** — fora de escopo por falta de dado real (§4.3).
- **Contato** (`/contato`) — não lido nesta análise; ao ser implementado/revisado, segue o
  mesmo sistema de 3 camadas tipográficas (H1 pode usar Fraunces como Sobre; formulário em
  si é sempre Geist Sans).

## 10. Paleta — avaliação (mantida, sem alteração)

A paleta terracota/âmbar atual (`guidelines.md` M0) já serve o objetivo fine-art — tom
quente coerente ("golden hour"), subsaturada o bastante para não competir com fotos de
paisagem/vida selvagem, contraste AA já verificado. Nenhuma das 3 referências avaliadas
motiva uma crítica concreta de contraste/harmonia que justifique trocar. Nenhuma mudança de
token de cor nesta spec.

## 11. Critérios de aceite (visual/UX, para `@reviewer` e `@qa`)

- [ ] `src/app/layout.tsx` carrega `Fraunces` via `next/font/google` (pesos 400/500,
      estilos normal/italic) e expõe `--font-serif` no `@theme inline` de `globals.css`.
- [ ] Fraunces aparece **somente** nos elementos listados em §3.2 — nunca no wordmark, nav,
      botões, formulário, breadcrumb, labels/eyebrows, corpo de Sobre, ou em `/admin/*`.
      Nenhum uso abaixo de `text-lg`, nenhum `tracking-tight`, nenhum peso ≥ 600.
- [ ] **Nenhum texto é renderizado sobre a área de pixels de uma foto em qualquer tela** —
      hero da Home, cards do grid, thumbnails de projeto e imagem do lightbox não têm
      nenhum elemento de texto posicionado por cima da imagem (verificável inspecionando
      que nenhum texto tem `position: absolute`/`fill` coincidente com a área de uma
      `<Image>`).
- [ ] A sidebar nunca usa opacidade reduzida nem `backdrop-blur` sobre foto — fundo sempre
      100% opaco (`bg-background` sólido), inclusive na seção do hero da Home, onde ela
      flutua sobre a foto sem nunca ficar translúcida (decisão §2.1.1).
- [ ] Na Home, a foto do hero se estende visualmente até a borda esquerda real da viewport
      (por trás da sidebar) em `≥lg`; a sidebar permanece opaca por cima; fora da altura do
      hero (grid, demais páginas), a sidebar volta a reservar espaço real no fluxo do
      documento, sem sobrepor nenhuma foto do grid.
- [ ] Se a sidebar (§4) foi aprovada por `@arquiteto`: `site-sidebar.tsx` substitui
      `site-header.tsx` em `(public)/layout.tsx`; wordmark em dois pesos (nome bold +
      sobrenome/papel leve); nav vertical com 3 itens (Início/Sobre/Contato), item ativo
      com `aria-current` + sublinhado; colapsa para barra + menu abaixo de `lg` reutilizando
      o padrão de `docs/design/admin-dashboard.md` §2.4. Se **não** aprovada: header
      horizontal atual mantido, com o mesmo tratamento de wordmark em dois pesos (linha
      única).
- [ ] Home exibe bloco de destaque (capa do 1º projeto, `object-cover`, sem texto
      sobreposto, com seta de scroll acessível por teclado) acima do grid dos projetos
      restantes. Com 1 projeto publicado, mostra só o destaque. Com 0, mantém estado vazio.
- [ ] Nenhuma foto do grid (Home, projeto) ou do lightbox tem `border`/`rounded-*` — cantos
      retos; raio (`rounded-md`) só em chrome de UI (moldura do `<dialog>`, botões, inputs,
      menu mobile da sidebar).
- [ ] Legendas do grid da Home: padrão "índice + travessão + título", sempre visíveis
      (`<figure>`/`<figcaption>`), nunca dependentes de hover.
- [ ] Página de projeto: eyebrow "N FOTOGRAFIAS" (omitida se 0 fotos), H1 Fraunces,
      descrição (se houver) em Fraunces itálico, `py-16`+ de respiro antes do grid.
- [ ] Lightbox mostra contador "NN / NN" (`tabular-nums`); imagem sempre `object-contain`
      com proporção real (nunca cropada).
- [ ] Toda transição/animação usa só `transform`/`opacity` (nunca `transition: all`) e tem
      comportamento reduzido/instantâneo sob `prefers-reduced-motion: reduce` (verificável
      via DevTools → emulate CSS media feature).
- [ ] Nenhuma regressão de contraste AA: texto em `text-xs` sempre `text-foreground` (nunca
      `text-muted`); descrição em itálico usa `text-foreground`.
- [ ] Nenhuma regressão de LCP percebido: só a imagem do bloco de destaque da Home tem
      `priority`/`fetchpriority="high"`; demais imagens abaixo da dobra mantêm
      `loading="lazy"` (padrão do `next/image`, já em uso).
- [ ] `src/app/admin/**` inalterado por esta spec.
