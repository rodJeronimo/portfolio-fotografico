---
id: TASK-0015
title: "Layout admin compartilhado + dashboard/hub em /admin"
milestone: ADR-0006
owner: "@frontend"
status: Pronta
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

- [ ] Nav aparece em todas as rotas `/admin/*` exceto `/admin/login`, com os
      3 itens na ordem Dashboard → Projetos → Configurações, mais Sair.
- [ ] Item de nav correspondente à rota atual (incluindo sub-rotas de
      Projetos, ex. `/admin/projects/[projectId]/fotos`) está marcado como
      ativo visualmente (cor + sublinhado/borda, não só cor) e via
      `aria-current="page"`.
- [ ] Em viewport < 768px, nav colapsa em menu com toggle acessível por
      teclado (`aria-expanded`, `aria-controls`); Sair permanece sempre
      visível fora do menu colapsado; menu fecha ao navegar e ao pressionar
      `Esc`.
- [ ] `/admin` exibe exatamente 2 cards (Projetos, Configurações), cada um
      com título + descrição de 1–2 linhas, link cobrindo o card inteiro,
      `href` correto (`/admin/projects`, `/admin/settings`).
- [ ] Todos os elementos interativos (itens de nav, toggle mobile, Sair,
      cards) têm anel de foco visível ao navegar por teclado e alvo de
      toque ≥ 44×44px.
- [ ] Nenhum novo token de cor/tipografia/raio introduzido fora dos já
      definidos em `docs/design/guidelines.md` (M0).
- [ ] Se a contagem de projetos/fotos for implementada, sua ausência/erro
      não quebra a renderização dos cards (falha isolada, silenciosa).
- [ ] Logout funciona via Server Action (`signOut`), sem modal de
      confirmação, e leva de volta a um estado deslogado (redirect para
      login ou home pública, conforme padrão já usado em
      `admin/login/page.tsx`).
- [ ] `npm run lint` e `npm run typecheck` (ou equivalente do projeto) passam
      sem erros.
- [ ] Validado por `@qa` (a11y — navegação por teclado, leitor de tela para
      `aria-current`/`aria-expanded` — e checagem visual do checklist acima).

## Dependências

Nenhuma dependência de outra task do board. Gate de arquitetura e design já
satisfeitos (ADR-0006 Aceito, `docs/design/admin-dashboard.md` aprovado pelo
usuário). Não há dependência técnica com TASK-0014, mas recomenda-se mesclar
em `develop` antes ou em paralelo, evitando conflito de merge em
`src/app/admin/`.

## Resultado

*(preenchido pelo @pm ao final, com base no relato do agente responsável e na aprovação de @qa/@reviewer)*

- Entregue em:
- Desvios em relação aos critérios de aceite:
- PR/commit relacionado:
- Pendências remanescentes:
