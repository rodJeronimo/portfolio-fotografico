---
id: TASK-0020
title: "Admin: seção 'Destaque da Home' em /admin/settings"
milestone: ADR-0007
owner: "@frontend"
status: Concluida
depends_on: [TASK-0017]
related_docs: [docs/ADR/0007-home-featured-project-setting.md, docs/design/admin-dashboard.md]
---

# TASK-0020 — Admin: seção "Destaque da Home" em /admin/settings

## Contexto

`docs/ADR/0007-home-featured-project-setting.md` (Aceito) decide estender `/admin/settings`
(sem novo card no hub — `ADR-0006` preservado) com um controle para o dono do site escolher
qual projeto aparece em destaque na Home. `docs/design/admin-dashboard.md` §5 especifica a
camada visual/interação sobre essa decisão já fechada.

## Escopo

- `src/app/admin/settings/page.tsx` / `settings-form.tsx` (ou componente irmão): nova seção
  "Destaque da Home" abaixo de "Sobre Mim", separada por divisor (`border-t border-border
  pt-6 mt-2`), com `<h2>`, texto de apoio explicando o comportamento automático, `<select>`
  nativo ("Automático (ordem de exibição)" `value=""` + 1 opção por projeto no formato
  "{título} (/{slug})", ordenado por `displayOrder`), preview `64×48` client-side (sem fetch
  adicional ao trocar seleção, usando um mapa de dados recebido como prop do Server
  Component), placeholder textual "Sem foto" quando o projeto selecionado não tem capa,
  estado de 0 projetos cadastrados (`<select>` `disabled` + texto explicativo em vez de
  esconder a seção).
- Submissão via `updateSiteSetting` (entregue em TASK-0017) com
  `key: "home.featuredProjectId"`, `value: { projectId: selected || null }`,
  `locale: "pt-BR"`; estado de loading/sucesso/erro independente da seção "Sobre Mim" (cada
  seção com seu próprio estado local).
- Acessibilidade: `<label htmlFor>` associado ao select (não `aria-label` solto), foco
  visível no select e no botão "Salvar", alvo de toque ≥44×44px, `alt` descritivo na
  preview quando há foto.
- Sem confirmação/modal antes de salvar (não é ação destrutiva).
- Fora de escopo: lógica de leitura/fallback, validação Zod e `revalidatePath` (TASK-0017,
  pré-requisito, já entrega a action e os dados de preview reaproveitando a query da Home
  pública); mudança de nav/hub do admin (`ADR-0006` inalterado, nenhum novo card/rota); foto
  de hero distinta da capa do projeto (`project.cover_photo_id` sem UI — débito registrado
  no ADR-0007).

## Critérios de aceite

- [x] Given `/admin/settings`, When a página carrega, Then a seção "Destaque da Home"
      aparece abaixo de "Sobre Mim", com estado de submit independente.
- [x] Given o select de projeto em destaque, When inspecionado, Then a primeira opção é
      "Automático (ordem de exibição)" (`value=""`), seguida de todos os projetos no formato
      "{título} (/{slug})", ordenados por `displayOrder`.
- [x] Given o operador troca a seleção do select, When a preview atualiza, Then reflete a
      capa do projeto selecionado (inclusive quando "Automático" está selecionado, mostrando
      a capa do projeto que seria escolhido hoje) sem nova requisição de rede.
- [x] Given um projeto sem foto de capa é selecionado, When a preview renderiza, Then mostra
      o placeholder "Sem foto" sem quebrar o formulário.
- [x] Given 0 projetos cadastrados, When a seção renderiza, Then o select fica `disabled` com
      texto explicando o motivo, em vez de esconder a seção.
- [x] Given o operador salva "Destaque da Home", When a submissão é concluída, Then o
      estado de sucesso/erro não afeta a seção "Sobre Mim" e vice-versa.
- [x] Select e botão "Salvar" desta seção têm `<label htmlFor>` associado, anel de foco
      visível e alvo de toque ≥44×44px; nenhum token novo de cor/tipografia/raio introduzido
      (reaproveita o vocabulário visual já em uso no admin, `docs/design/guidelines.md`).
- [x] `lint` e `type-check` passam sem erros.

## Dependências

TASK-0017 (backend: action, validação, `revalidatePath`, dados de preview). Não bloqueia nem
depende das tasks de redesign público (TASK-0016/0018/0019) — pode rodar em paralelo com
elas.

## Resultado

- Entregue em: 2026-08-23
- Resumo: seção "Destaque da Home" adicionada em `/admin/settings`, com `<select>` nativo
  (opção "Automático" + projetos por `displayOrder`) e preview de capa 64×48 client-side,
  sem requisição de rede adicional ao trocar seleção. `@reviewer` e `@qa` aprovaram com
  ressalvas não bloqueantes.
- Desvios em relação aos critérios de aceite: nenhum desvio funcional; ressalvas cosméticas
  registradas como débitos (ver Pendências).
- PR/commit relacionado: PR #26 (merged em `develop`).
- Pendências remanescentes:
  - Débito cosmético: no estado de 0 projetos, o texto de apoio padrão e o texto de erro
    aparecem simultaneamente em vez do segundo substituir o primeiro.
  - Débito de cobertura: sem teste de componente para o formulário novo — consistente com o
    padrão já existente no projeto (não é regressão), mas registrado para revisão futura.
