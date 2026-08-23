---
id: TASK-0017
title: "Destaque da Home configurável (site_settings home.featuredProjectId)"
milestone: ADR-0007
owner: "@backend"
status: Pronta
depends_on: []
related_docs: [docs/ADR/0007-home-featured-project-setting.md, docs/design/admin-dashboard.md]
---

# TASK-0017 — Destaque da Home configurável (site_settings home.featuredProjectId)

## Contexto

O dono do site pediu controle explícito de qual projeto aparece em destaque na Home, sem
depender de reordenar `displayOrder` (que afeta o grid inteiro). `docs/ADR/0007-home-featured-project-setting.md`
(Aceito) decide representar isso como uma nova chave em `site_settings`
(`home.featuredProjectId`), zero migration, com fallback resiliente a projeto excluído ou
configuração ausente. Esta task implementa a camada de dados/leitura/escrita; a renderização
do hero na Home pública (TASK-0018) e a UI de admin (TASK-0020) dependem dela.

## Escopo

- Nova chave em `site_settings`: `key = "home.featuredProjectId"`, `locale = "pt-BR"`,
  `value` jsonb `{ "projectId": "<uuid>" | null }`. **Nenhuma migration de schema.**
- Validação (Zod ou equivalente) do formato do `value` para esta chave — avaliar se
  `updateSiteSetting` precisa de um schema específico por `key` (hoje `about.content` guarda
  string; o novo uso guarda objeto).
- Implementar `getFeaturedProject()` (ou equivalente) na camada de dados: lê
  `home.featuredProjectId`; se aponta para um projeto que ainda existe, retorna esse
  projeto (com dados de capa); em qualquer outro caso (chave ausente, `projectId: null`,
  projeto excluído) cai no fallback já especificado em `public-site-redesign.md` §5.1
  (primeiro projeto por `displayOrder`) — nunca lança erro nem quebra a página.
- Corrigir `revalidatePath` em `src/app/admin/settings/actions.ts`: hoje chama apenas
  `/admin/settings` e `/sobre` — passa a incluir também `/` (Home pública lê
  `home.featuredProjectId`), gap já sinalizado por `@ux-designer`.
- Expor os dados necessários para o preview do admin (capa: `storageKey`, `blurDataUrl`,
  `width`, `height`; título e slug de cada projeto) reaproveitando a query já usada pela Home
  pública, sem nova query dedicada — consumido pela TASK-0020.
- Fora de escopo: renderização do hero na Home pública (TASK-0018, `@frontend` consome
  `getFeaturedProject()`); UI do select/preview em `/admin/settings` (TASK-0020,
  `@frontend`); foto de hero distinta da capa do projeto (`project.cover_photo_id` sem UI —
  débito registrado no ADR-0007, task futura de `@pm`).

## Critérios de aceite

- [ ] Given nenhuma linha `home.featuredProjectId` em `site_settings`, When
      `getFeaturedProject()` é chamado, Then retorna o primeiro projeto por `displayOrder`
      (comportamento automático).
- [ ] Given `home.featuredProjectId` aponta para um projeto existente, When
      `getFeaturedProject()` é chamado, Then retorna esse projeto.
- [ ] Given `home.featuredProjectId` aponta para um projeto que foi excluído, When
      `getFeaturedProject()` é chamado, Then cai no fallback automático sem lançar erro.
- [ ] Given a action de update de settings é chamada com `key = "home.featuredProjectId"`,
      When a escrita é bem-sucedida, Then `revalidatePath` é disparado para `/`,
      `/admin/settings` e `/sobre` (condicional por `key` ou sempre — `/` obrigatório para
      esta chave).
- [ ] Testes unitários cobrindo os três casos de resolução (ausente, válido, órfão),
      aprovados por `@qa`.
- [ ] `lint` e `type-check` passam sem erros.

## Dependências

Nenhuma — gate de arquitetura já satisfeito (ADR-0007 Aceito). Bloqueia TASK-0018 (Home
consome `getFeaturedProject()`) e TASK-0020 (admin UI consome a action e os dados de
preview).

## Resultado

*(preenchido pelo @pm ao final, com base no relato do agente responsável e na aprovação de @qa/@reviewer)*

- Entregue em:
- Desvios em relação aos critérios de aceite:
- PR/commit relacionado:
- Pendências remanescentes:
