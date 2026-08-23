---
id: TASK-0015
title: "Layout admin compartilhado + dashboard/hub em /admin"
milestone: ADR-0006
owner: "@frontend"
status: Concluida
depends_on: []
related_docs: [docs/ADR/0006-admin-dashboard-navigation.md, docs/design/admin-dashboard.md, docs/design/guidelines.md]
---

# TASK-0015 — Layout admin compartilhado + dashboard/hub em /admin

## Contexto

`/admin` hoje é um placeholder ("Autenticado com sucesso.") sem navegação — o
operador precisa conhecer as URLs de cor para alcançar `/admin/projects` e
`/admin/settings`. O ADR-0006 (Aceito) decide introduzir um layout
compartilhado com nav persistente, e transformar `/admin/page.tsx` num
dashboard/hub com cards de entrada. `@ux-designer` já especificou a camada
visual/interação completa em `docs/design/admin-dashboard.md` (nav header
horizontal, item ativo via `usePathname()`, menu mobile colapsável, logout via
Server Action, critérios de acessibilidade WCAG AA). Esta task implementa a
decisão e a especificação já aprovadas — não requer nova validação de
arquitetura ou design.

## Escopo

- Criar `src/app/admin/layout.tsx` (Server Component) envolvendo todas as
  rotas `/admin/*` exceto `/admin/login`, com nav persistente conforme
  `docs/design/admin-dashboard.md` seção 2.
- Criar `src/components/admin/admin-nav.tsx` (Client Component): itens
  Dashboard / Projetos / Configurações + Sair, item ativo via
  `usePathname()` (match exato para `/admin`, prefixo para
  `/admin/projects*` e `/admin/settings*`), menu mobile colapsável abaixo de
  `md`, logout via `<form action={...}>` chamando `signOut` de `@/lib/auth`.
- Reescrever `src/app/admin/page.tsx` como dashboard/hub: título + subtítulo
  opcional, grid de exatamente 2 cards (Projetos → `/admin/projects`,
  Configurações → `/admin/settings`) conforme seção 3 do doc de design.
  Contagem opcional de projetos/fotos no card "Projetos" é enhancement, não
  obrigatório (ver seção 3.2/3.4 do doc de design) — decisão de
  implementação de `@frontend`.
- Aplicar os critérios de acessibilidade da seção 4 do doc de design
  (contraste, alvo de toque ≥44px, `aria-current`, `aria-expanded`/
  `aria-controls`, foco visível, sem dependência exclusiva de cor).
- Fora de escopo: migração de rota de fotos (TASK-0014); qualquer mudança em
  `admin/settings/*` ou `admin/projects/*` além do necessário para o nav
  reconhecer essas rotas como ativas.

## Critérios de aceite

Baseados na checklist da seção 5 de `docs/design/admin-dashboard.md`:

- [x] Nav aparece em todas as rotas `/admin/*` exceto `/admin/login`, com os
      3 itens na ordem Dashboard → Projetos → Configurações, mais Sair.
- [x] Item de nav correspondente à rota atual (incluindo sub-rotas de
      Projetos, ex. `/admin/projects/[projectId]/fotos`) está marcado como
      ativo visualmente (cor + sublinhado/borda, não só cor) e via
      `aria-current="page"`.
- [x] Em viewport < 768px, nav colapsa em menu com toggle acessível por
      teclado (`aria-expanded`, `aria-controls`); Sair permanece sempre
      visível fora do menu colapsado; menu fecha ao navegar e ao pressionar
      `Esc`.
- [x] `/admin` exibe exatamente 2 cards (Projetos, Configurações), cada um
      com título + descrição de 1–2 linhas, link cobrindo o card inteiro,
      `href` correto (`/admin/projects`, `/admin/settings`).
- [x] Todos os elementos interativos (itens de nav, toggle mobile, Sair,
      cards) têm anel de foco visível ao navegar por teclado e alvo de
      toque ≥ 44×44px.
- [x] Nenhum novo token de cor/tipografia/raio introduzido fora dos já
      definidos em `docs/design/guidelines.md` (M0).
- [x] Se a contagem de projetos/fotos for implementada, sua ausência/erro
      não quebra a renderização dos cards (falha isolada, silenciosa).
- [x] Logout funciona via Server Action (`signOut`), sem modal de
      confirmação, e leva de volta a um estado deslogado (redirect para
      login ou home pública, conforme padrão já usado em
      `admin/login/page.tsx`).
- [x] `npm run lint` e `npm run typecheck` (ou equivalente do projeto) passam
      sem erros.
- [x] Validado por `@qa` (a11y — navegação por teclado, leitor de tela para
      `aria-current`/`aria-expanded` — e checagem visual do checklist acima),
      com ressalvas não bloqueantes (ver Resultado).

## Dependências

Nenhuma dependência de outra task do board. Gate de arquitetura e design já
satisfeitos (ADR-0006 Aceito, `docs/design/admin-dashboard.md` aprovado pelo
usuário). Não há dependência técnica com TASK-0014, mas recomenda-se mesclar
em `develop` antes ou em paralelo, evitando conflito de merge em
`src/app/admin/`.

## Resultado

Implementada por `@frontend` em `feature/TASK-0015-layout-admin-dashboard`.
Criado `src/app/admin/layout.tsx` com nav persistente, `src/components/admin/admin-nav.tsx`
(item ativo via `usePathname()`, menu mobile colapsável, logout via Server
Action), e `src/app/admin/page.tsx` reescrito como dashboard/hub com os 2
cards (Projetos, Configurações), conforme `docs/design/admin-dashboard.md`.

Durante o desenvolvimento em paralelo com a TASK-0014 no mesmo diretório de
trabalho, a branch incorporou por engano um commit idêntico ao de TASK-0014
(colisão de working directory entre as duas sessões/agentes) — identificado
por `@reviewer` e `@qa` antes do merge, corrigido via `git rebase
origin/develop` (removeu o commit duplicado automaticamente) e atualização da
descrição do PR, sem alterar o código real desta task. `@reviewer` e `@qa`
aprovaram o PR com duas ressalvas não bloqueantes: (1) pequena inconsistência
visual do indicador de item ativo entre desktop/mobile no menu de nav (cor +
peso no mobile vs. cor + borda no desktop) — mitigada por `aria-current` e
texto `sr-only`, não é violação WCAG, mas fica em aberto para nivelamento
visual futuro por `@ux-designer`; (2) falta teste unitário para a função
`isActive()` de matching de rota ativa em `admin-nav.tsx`. Mergeada em
`develop`.

Nota de processo: esta task rodou em paralelo com a TASK-0014 no mesmo
diretório de trabalho, o que causou a colisão descrita acima; recuperado sem
perda de trabalho, mas consumiu tempo extra — recomenda-se evitar
paralelismo no mesmo working directory em tasks futuras que tocam a mesma
área do código (`src/app/admin/`).

- Entregue em: `develop` (via PR #19, `feature/TASK-0015-layout-admin-dashboard`).
- Desvios em relação aos critérios de aceite: nenhum desvio funcional — a branch precisou de rebase para remover um commit duplicado incorporado por colisão de working directory com a TASK-0014, sem impacto no código entregue.
- PR/commit relacionado: PR #19.
- Pendências remanescentes: (1) inconsistência visual não bloqueante do indicador de item ativo entre desktop/mobile no nav, para nivelamento futuro por `@ux-designer`; (2) falta teste unitário para `isActive()` em `admin-nav.tsx`.
