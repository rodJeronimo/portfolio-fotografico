# ADR-0007: Projeto em destaque da Home como configuração explícita (`site_settings`)

## Status
Aceito

## Contexto
`docs/design/public-site-redesign.md` §5.1 (redesign fine-art, ainda não implementado) define
que o bloco de destaque da Home é derivado automaticamente: o primeiro projeto por
`displayOrder` mais baixo, usando a capa desse projeto (`items[0]`, já buscado hoje em
`src/app/(public)/page.tsx`, "zero mudança de schema/query").

O dono do site pediu controle explícito e editável: não quer depender de reordenar
`displayOrder` (que também afeta o grid inteiro) só para trocar qual projeto aparece em
destaque na Home. Pedido literal: "preciso que o admin considere páginas ou seções
específicas para eu atualizar essas imagens que aparecem em página inicial, projetos em
destaque, etc. Como uma configuração da home".

O admin já tem um mecanismo de configuração singleton de conteúdo do site: `site_settings`
(`key`, `value` jsonb, `locale`, PK composta `(key, locale)`), hoje usado só para
`about.content` (`src/app/admin/settings/page.tsx`, `actions.ts`). Este ADR decide como
representar "projeto em destaque" nesse mecanismo, sem inflar escopo além do que foi pedido.

## Decision Drivers
- Simplicidade de migration: preferir zero/mínima mudança de schema a uma nova
  tabela/coluna, se o mecanismo existente já resolve.
- Consistência com o padrão já estabelecido (`site_settings` já é o lugar de configuração
  singleton editável do site — `about.content` é o precedente direto).
- Facilidade de implementação no admin (`@backend`/`@frontend`): reaproveitar
  `updateSiteSetting` (action existente) e o padrão de leitura já usado em
  `src/app/admin/settings/page.tsx`.
- Resiliência a estado inconsistente: projeto marcado como destaque pode ser excluído
  depois — a leitura não pode quebrar a Home nesse caso, precisa cair de volta no
  comportamento automático (fallback por `displayOrder`) sem exigir `ON DELETE` especial.
- Não expandir o escopo do pedido além do que tem valor concreto (o pedido menciona "etc.",
  mas a task precisa de um escopo fechado e defensável para esta rodada).

## Opções consideradas — modelo de dados

| Opção | Prós | Contras |
|---|---|---|
| (a) `project.isFeatured` boolean, com índice único parcial (`WHERE is_featured = true`) garantindo no máximo 1 | Integridade referencial automática (a flag some junto com o projeto, sem registro órfão); leitura trivial (`WHERE is_featured = true LIMIT 1`) | Nova coluna numa tabela já "quente" (CRUD de projeto); trocar o destaque exige transação de 2 escritas (desmarcar o antigo, marcar o novo); mistura conceito de "configuração de exibição da Home" dentro da entidade de domínio `project`, quando já existe um lugar dedicado a config (`site_settings`) |
| (b) `site_settings` — nova chave `home.featuredProjectId`, valor jsonb = `{ "projectId": "<uuid>" \| null }` (escolhida) | **Zero migration de schema** — reaproveita a tabela/mecanismo já existente e já usado para singleton config (`about.content` é o precedente direto); leitura/escrita reaproveitam `updateSiteSetting`/o padrão de `settings/page.tsx` quase sem código novo; `null`/ausência de linha = "automático", nenhuma UI extra para "desfazer override" | Sem FK de banco (jsonb não referencia `project.id`) — projeto marcado como destaque pode ser excluído, deixando a chave "pendurada" |
| (c) Nova tabela `home_config` dedicada, com coluna tipada `featured_project_id uuid REFERENCES project(id) ON DELETE SET NULL` | Integridade referencial real via FK, `ON DELETE SET NULL` cuida do caso de exclusão automaticamente | Nova tabela só para 1 campo singleton, quando já existe `site_settings` para exatamente esse propósito — duplica o conceito de "config singleton do site" em dois mecanismos paralelos, sem ganho proporcional ao custo |

**Decisão: opção (b).** O argumento decisivo é consistência — `site_settings` já É o
mecanismo de configuração singleton do site (o próprio nome, e o uso atual em
`about.content`), então "projeto em destaque da Home" é uma configuração do site, não um
atributo do domínio `project`. Introduzir uma coluna em `project` (opção a) ou uma tabela
nova (opção c) resolveria o mesmo problema com mais superfície de mudança para um ganho de
integridade que é mitigável de forma barata na leitura (ver abaixo) — e essa mitigação já
seria necessária de qualquer forma para lidar com o caso "nenhum destaque definido ainda"
(estado inicial, antes de o dono configurar algo pela primeira vez).

**Mitigação da falta de FK (o contra da opção b):** a leitura em
`src/app/(public)/page.tsx` trata a chave `home.featuredProjectId` como uma dica opcional,
nunca uma fonte de verdade que quebra a página se inválida:

1. Ler `site_settings` onde `key = 'home.featuredProjectId'` e `locale = 'pt-BR'`.
2. Se existir e `value.projectId` apontar para um projeto que **ainda existe**, usar esse
   projeto como destaque.
3. Em qualquer outro caso (chave ausente, `projectId: null`, ou projeto referenciado não
   encontrado — ex.: foi excluído depois de marcado) — **cair automaticammente** no
   comportamento já especificado em `public-site-redesign.md` §5.1: primeiro projeto por
   `displayOrder` mais baixo.

Isso significa que excluir o projeto marcado como destaque nunca gera erro ou tela quebrada
— a Home volta sozinha ao modo automático até o dono escolher outro destaque explícito (ou
não escolher nenhum, o que é um estado válido, não um erro). `@backend` implementa essa
função de resolução (`getFeaturedProject()` ou equivalente) como parte da task de
implementação da Home redesenhada — não requer trigger nem `ON DELETE` no banco.

## Onde isso vive no admin — não revisa ADR-0006

`docs/ADR/0006-admin-dashboard-navigation.md` fixou deliberadamente **exatamente 2 cards**
no hub (`/admin`): Projetos e Configurações — decisão explícita para o escopo daquele
momento, não uma regra permanente contra qualquer novo card.

Avaliado e decidido **não criar um 3º card/rota nova** para isso. A superfície adicionada é
um único controle (seletor do projeto em destaque, com opção "Automático") dentro de um
mecanismo de configuração que já existe e já tem página própria
(`/admin/settings`, hoje usado para editar `about.content`). Isso não é uma nova área de
gestão com fluxo próprio (como Projetos, que tem CRUD, sub-rota de fotos, etc.) — é mais um
campo de configuração singleton, exatamente o papel que `/admin/settings` já cumpre e para
o qual o card "Configurações" já foi descrito de forma aberta em
`docs/design/admin-dashboard.md` ("Editar conteúdo da página Sobre **e demais textos do
site**"). O driver original do ADR-0006 (evitar um 3º item de nav de primeiro nível por um
controle pontual) continua válido aqui.

**Decisão: estender `/admin/settings` com uma nova seção "Destaque da Home"**, abaixo (ou
acima) da seção existente de edição de "Sobre", na mesma página — dois `<form>`/blocos
independentes, mesmo padrão de `updateSiteSetting` já usado, chamando a mesma action com
`key: "home.featuredProjectId"`. Nenhuma mudança em `src/app/admin/layout.tsx` ou
`admin-nav.tsx`, nenhuma nova rota.

Consequência editorial (não estrutural, registrada aqui para rastreabilidade):
`docs/design/admin-dashboard.md` §3.2 descreve o card "Configurações" com o texto "Editar o
conteúdo da página Sobre e demais textos do site" — recomendo a `@ux-designer` ajustar essa
descrição para mencionar também o destaque da Home (ex.: "Editar o conteúdo da página
Sobre, o projeto em destaque da Home e demais configurações do site"), quando a
implementação entrar em andamento. Não é um bloqueio para este ADR nem uma mudança que este
agente deva fazer (fora do escopo de `@arquiteto`, que não edita `docs/design/**`).

Se no futuro a Home ganhar configuração substancialmente mais rica (múltiplos slots de
destaque, biblioteca de mídia dedicada, agendamento de destaque por data), aí sim reavaliar
uma rota/card dedicado — não é o caso hoje (1 campo).

## Escopo desta rodada

O pedido do dono ("página inicial, projetos em destaque, etc.") é aberto o suficiente para
justificar delimitar o escopo explicitamente:

**Incluído:**
- Controle explícito de **qual projeto** é o destaque da Home (`home.featuredProjectId` em
  `site_settings`, com opção "Automático" = comportamento atual de `displayOrder`).
- Fallback automático e resiliente a projeto excluído/config ausente (ver mitigação acima).
- Nova seção em `/admin/settings` para esse controle.

**Fora de escopo nesta rodada (decisão, não esquecimento):**
- **Foto específica do hero, distinta da capa "natural" do projeto.** O schema já tem
  `project.cover_photo_id` (nullable, FK → `photo.id`) — mas hoje **nenhuma tela do admin
  permite defini-lo**; a Home cai no fallback (`project_photo` ordenado por
  `display_order`, pega a primeira). Ou seja, o gap real não é "falta um campo de foto de
  hero dedicado" — é que o campo que já existe no schema (`cover_photo_id`) não tem UI.
  Resolver isso é mais barato e mais alinhado ao pedido do que criar um *segundo* conceito
  de "foto do hero" paralelo à "capa do projeto" (que geraria 3 níveis de fallback:
  hero override → cover_photo_id → primeira foto por ordem — complexidade desproporcional
  ao valor, sem pedido explícito do dono para uma foto *diferente* da capa). Registrado como
  débito/enhancement natural de próxima rodada: dar ao admin de fotos (
  `/admin/projects/[projectId]/fotos`) uma ação "Definir como capa" por foto, escrevendo em
  `project.cover_photo_id` — mesma mecânica de dados já existente, só falta UI. Não bloqueia
  esta ADR nem a implementação do destaque da Home (que funciona com o fallback atual).
- Ícones sociais, links externos, ou qualquer outra config de Home fora de "qual projeto é o
  destaque" — nada no pedido do dono ou na spec do redesign aponta necessidade concreta além
  disso.

## Decisão (resumo)
1. Nova chave em `site_settings`: `key = "home.featuredProjectId"`, `locale = "pt-BR"`,
   `value` jsonb no formato `{ "projectId": "<uuid>" }` (linha ausente ou `value.projectId:
   null` = modo automático). **Nenhuma migration de schema é necessária** — `site_settings`
   já suporta chaves arbitrárias.
2. `src/app/(public)/page.tsx` (na implementação do redesign, `@frontend`/`@backend`) passa
   a resolver o projeto de destaque via: `home.featuredProjectId` válido → senão, primeiro
   por `displayOrder` (comportamento já especificado em `public-site-redesign.md` §5.1,
   preservado como fallback, não substituído).
3. `/admin/settings` ganha uma seção "Destaque da Home": `<select>` listando projetos
   (título + slug) mais opção "Automático (ordem de exibição)", reaproveitando
   `updateSiteSetting`. `@ux-designer` especifica o detalhe visual dessa seção antes de
   `@frontend` implementar (mesma regra de orquestração já em vigor para telas novas).
4. Nenhum novo card/rota no hub admin — `ADR-0006` permanece válido e não é revisado por
   este ADR.
5. Foto de hero explícita fica fora de escopo nesta rodada; gap relacionado
   (`project.cover_photo_id` sem UI) é registrado como débito para task futura de `@pm`.

## Consequências
- Positivo: resolve o pedido do dono (controle explícito do destaque, sem depender de
  reordenar todos os projetos) com custo de implementação mínimo — zero migration,
  reaproveita mecanismo e action já existentes.
- Positivo: nenhuma mudança estrutural no admin (nav, rotas) — ADR-0006 permanece íntegro.
- Positivo: resiliente por construção a projeto excluído (fallback automático), sem
  necessidade de lógica de limpeza (`ON DELETE`) no banco.
- Negativo/aceito: sem FK de banco para `home.featuredProjectId` — integridade é garantida
  na camada de leitura (aplicação), não no schema. Aceitável porque o pior caso (referência
  inválida) já tem um fallback definido, não um erro.
- Neutro: `project.cover_photo_id` continua sem UI própria — não piora nem resolve o débito
  existente; deixado explícito para não ser perdido.
- Segue: `@backend` implementa a leitura/escrita (`getFeaturedProject()`, extensão da
  action de settings); `@ux-designer` especifica a seção "Destaque da Home" em
  `docs/design/admin-dashboard.md` (ou novo doc, a critério dela); `@pm` registra a task
  correspondente no board com este ADR como referência de impacto estrutural já validado.
