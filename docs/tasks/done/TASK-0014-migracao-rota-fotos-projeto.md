---
id: TASK-0014
title: "Migrar rota de fotos para /admin/projects/[projectId]/fotos"
milestone: ADR-0006
owner: "@backend"
status: Concluida
depends_on: []
related_docs: [docs/ADR/0006-admin-dashboard-navigation.md]
---

# TASK-0014 — Migrar rota de fotos para /admin/projects/[projectId]/fotos

## Contexto

`/admin/fotos?projectId=...` usa query param em vez de rota dinâmica aninhada,
tornando a URL não autodescritiva e "órfã" da hierarquia real do domínio
(projeto → fotos). O ADR-0006 (já Aceito, commitado em `develop`) decide migrar
para `/admin/projects/[projectId]/fotos`. Esta task implementa a decisão já
validada por `@arquiteto` — não requer nova validação de arquitetura.

## Escopo

- Mover `src/app/admin/fotos/page.tsx`, `actions.ts`, `upload-form.tsx`,
  `photo-reorder-list.tsx` para `src/app/admin/projects/[projectId]/fotos/`
  (ler `projectId` via `params`, não via `searchParams`).
- Ajustar todo `revalidatePath("/admin/fotos")` (e variantes) nas Server
  Actions para `revalidatePath(\`/admin/projects/${projectId}/fotos\`)`.
- Ajustar o link em `src/app/admin/projects/page.tsx` — era
  `/admin/fotos?projectId=${p.id}`, passa a ser `/admin/projects/${p.id}/fotos`
  (ajuste pontual e acoplado à migração; incluído nesta task em vez de task
  separada porque a rota só funciona ponta a ponta com ambas as pontas
  alteradas juntas — ver `docs/ADR/0006-admin-dashboard-navigation.md`,
  seção "Consequências").
- Remover a pasta antiga `src/app/admin/fotos/` por completo (sem redirect
  permanente — é uma URL administrativa interna, não indexada/pública, sem
  necessidade de compatibilidade retroativa).
- Fora de escopo: layout/nav compartilhado e dashboard `/admin` (TASK-0015);
  mudança de schema (nenhuma é necessária, `project.id` já é a FK usada).

## Critérios de aceite

- [x] Given um admin autenticado em `/admin/projects`, When clica em
      "Gerenciar fotos" de um projeto, Then é levado para
      `/admin/projects/{projectId}/fotos` (não mais `/admin/fotos?projectId=`).
- [x] Given a rota `/admin/projects/{projectId}/fotos`, When a página carrega,
      Then lista as fotos do projeto correto (mesmo comportamento funcional de
      antes: upload, exclusão, reordenação drag-and-drop).
- [x] Given uma foto é enviada, excluída ou reordenada em
      `/admin/projects/{projectId}/fotos`, When a Server Action correspondente
      roda, Then `revalidatePath` aponta para a nova rota (sem cache stale) e,
      quando aplicável, para as rotas públicas do projeto (mesmo
      comportamento já existente em `TASK-0013`).
- [x] Given a pasta `src/app/admin/fotos/` antiga, When a migração é
      concluída, Then ela não existe mais no repositório (sem código morto).
- [x] `npm run lint` e `npm run typecheck` (ou equivalente do projeto) passam
      sem erros após a migração.
- [x] Testes existentes que referenciam `/admin/fotos` (unitários/e2e, se
      houver) são atualizados para a nova rota e continuam verdes —
      confirmado por `@qa`.

## Dependências

Nenhuma dependência de outra task do board. Gate de arquitetura já satisfeito
(ADR-0006 Aceito). Não há dependência técnica com TASK-0015 (rotas e
layout/dashboard são mudanças independentes no filesystem), mas recomenda-se
mesclar em `develop` antes ou em paralelo, evitando conflito de merge em
`src/app/admin/`.

## Resultado

Implementada por `@backend` em `feature/TASK-0014-migracao-rota-fotos-projeto`.
Rota de fotos migrada de `/admin/fotos?projectId=` para
`/admin/projects/[projectId]/fotos`, com todos os `revalidatePath` e o link em
`src/app/admin/projects/page.tsx` ajustados; pasta antiga `src/app/admin/fotos/`
removida. `@reviewer` aprovou o PR com ressalva sobre ordem de merge em
relação à TASK-0015. `@qa` reprovou na primeira rodada: o e2e
`tests/e2e/admin-upload.spec.ts` ainda validava a URL antiga
(`/admin/fotos?projectId=`); corrigido para `/admin/projects/[projectId]/fotos`,
CI voltou a ficar verde e `@qa` aprovou. Mergeada em `develop`.

Nota de processo: esta task rodou em paralelo com a TASK-0015 no mesmo
diretório de trabalho, o que causou colisões (stash acidental, commit
duplicado incorporado na branch da TASK-0015); recuperado sem perda de
trabalho, mas consumiu tempo extra — recomenda-se evitar paralelismo no mesmo
working directory em tasks futuras que tocam a mesma área do código
(`src/app/admin/`).

- Entregue em: `develop` (via PR #20, `feature/TASK-0014-migracao-rota-fotos-projeto`).
- Desvios em relação aos critérios de aceite: nenhum desvio final — houve reprovação inicial de `@qa` por assert de e2e desatualizado, corrigida antes do merge.
- PR/commit relacionado: PR #20.
- Pendências remanescentes: débito não bloqueante registrado por `@qa` — nenhum teste unitário cobre a lógica de `revalidatePath` por múltiplos projetos afetados em `deletePhoto`.
