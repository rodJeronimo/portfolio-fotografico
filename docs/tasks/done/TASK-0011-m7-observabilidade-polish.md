---
id: TASK-0011
title: "M7 — Observabilidade e polish"
milestone: M7
owner: "@frontend"
status: Concluida
depends_on: [TASK-0010]
related_docs: [docs/architecture/known-issues.md]
---

# TASK-0011 — M7: Observabilidade e polish

## Contexto
Fechar lacunas de produção: analytics, tratamento de erro, estados de loading/vazio.

## Escopo
Vercel Analytics/Speed Insights, `error.tsx`, `not-found.tsx`, `loading.tsx` por rota relevante, skeletons, empty states (ex.: projeto sem fotos).

## Critérios de aceite
- [x] Vercel Analytics e Speed Insights ativos e reportando dados. Pacotes instalados e componentes adicionados ao layout root — reportar dados de verdade só acontece em produção real (Vercel detecta automaticamente), não testável localmente.
- [x] Toda rota pública tem `error.tsx`/`not-found.tsx` tratando falhas com UI coerente. Implementado em `(public)/error.tsx` e `(public)/not-found.tsx` (+ override específico em `projetos/[slug]/not-found.tsx` com mensagem mais precisa). **Revisão formal de `@ux-designer` não feita** (sessão solo).
- [x] Estados de loading exibem skeleton, não tela em branco. `loading.tsx` em `(public)` (home), `sobre/`, `projetos/[slug]/` — componente `GridSkeleton` reutilizável.
- [x] Projeto sem fotos exibe empty state claro em vez de grid vazio silencioso. Já existia desde M4 (`PhotoGallery`: "Nenhuma foto ainda.").

## Dependências
TASK-0010.

## Resultado

- **Analytics**: `@vercel/analytics` + `@vercel/speed-insights`, componentes `<Analytics />`/`<SpeedInsights />` no `layout.tsx` root.
- **Error/Not-found**: `(public)/error.tsx` (client, botão "Tentar novamente"), `(public)/not-found.tsx` (genérico), `projetos/[slug]/not-found.tsx` (mensagem específica "Projeto não encontrado").
- **Loading/skeletons**: `src/components/gallery/grid-skeleton.tsx` reutilizado em `(public)/loading.tsx` (home), `sobre/loading.tsx` (texto), `projetos/[slug]/loading.tsx` (grid). `/contato` não tem `loading.tsx` — não faz fetch assíncrono, não há estado de loading real a cobrir.
- **Bug real encontrado e investigado a fundo (não corrigido)**: `notFound()` em `projetos/[slug]` retorna **HTTP 200** em vez de 404. Isolado via 8 repros mínimas descartáveis — confirmado que é um bug do Next 15.5.23 específico de rotas dinâmicas dentro de route groups `(nome)`, independente de `not-found.tsx`/`error.tsx`/`layout.tsx`/queries assíncronas. Documentado em detalhe com a matriz de testes em `docs/architecture/known-issues.md`, incluindo mitigação futura sugerida (mover checagem pro middleware). Impacto é SEO-only (soft 404), não afeta UX real nem funcionalidade — decisão consciente de não reestruturar a arquitetura de pastas pra contornar um bug de framework sem confirmação de que resolveria.
- **Validação real**: build de produção real (`next build` + `next start`, não `next dev`) usado para todos os testes de status HTTP — devidamente isolado de comportamento de dev server. Conteúdo de not-found/loading verificado visualmente via `curl`.
- **Pendência**: revisão heurística de `@ux-designer` para as novas telas de erro/not-found/loading (não feita, sessão solo).
