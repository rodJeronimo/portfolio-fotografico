# Board — Portfólio Fotográfico

Owner: `@pm`. Fonte única de verdade do progresso. Cada linha aponta para o arquivo de task em `docs/tasks/backlog/` (ou `docs/tasks/done/` quando concluída). Status possíveis: `Backlog`, `Pronta`, `Em andamento`, `Em revisao`, `Concluida`, `Bloqueada`.

## Fase 2–4 (Setup)

| ID | Título | Milestone | Agente | Status |
|---|---|---|---|---|
| [TASK-0001](done/TASK-0001-setup-projeto-gitflow-github.md) | Setup projeto Next.js, GitFlow, GitHub | Fase2 | `@devops` | Concluida |
| [TASK-0002](done/TASK-0002-pipeline-cicd.md) | Pipeline CI/CD (GitHub Actions) | Fase3 | `@devops` | Concluida |
| [TASK-0003](backlog/TASK-0003-deploy-vercel.md) | Configuração de deploy na Vercel | Fase4 | `@devops` | Em andamento (secrets ok, env vars reais pendentes) |

## Fase 5 (Implementação incremental)

| ID | Título | Milestone | Agente | Status |
|---|---|---|---|---|
| [TASK-0004](done/TASK-0004-m0-fundacao.md) | Fundação: design tokens, layout root, fontes | M0 | `@frontend` | Concluida |
| [TASK-0005](backlog/TASK-0005-m1-db-auth.md) | DB e Auth: schema Drizzle, NextAuth v5 | M1 | `@backend` | Bloqueada (requer conta Neon + GitHub OAuth App) |
| [TASK-0006](backlog/TASK-0006-m2-admin-upload-mvp.md) | Admin upload MVP | M2 | `@backend` | Backlog |
| [TASK-0007](backlog/TASK-0007-m3-pipeline-imagens.md) | Pipeline de imagens (otimização, LQIP, ordenação) | M3 | `@backend` | Backlog |
| [TASK-0008](backlog/TASK-0008-m4-galeria-publica.md) | Galeria pública (Home, projetos, lightbox) | M4 | `@frontend` | Backlog |
| [TASK-0009](backlog/TASK-0009-m5-sobre-contato.md) | Sobre Mim e Contato | M5 | `@backend` | Backlog |
| [TASK-0010](backlog/TASK-0010-m6-seo.md) | SEO (metadata, sitemap, JSON-LD, OG) | M6 | `@backend` | Backlog |
| [TASK-0011](backlog/TASK-0011-m7-observabilidade-polish.md) | Observabilidade e polish | M7 | `@frontend` | Backlog |
| [TASK-0012](backlog/TASK-0012-m8-e2e-hardening.md) | Testes e2e e hardening final | M8 | `@qa` | Backlog |

## Convenções

- Nenhuma task muda para `Pronta` sem que suas dependências estejam `Concluida` (ou, no caso de dependência estrutural, sem validação de `@arquiteto`).
- Nenhuma task muda para `Concluida` sem aprovação de `@qa` (suite verde) e `@reviewer` (PR aprovado).
- Tasks concluídas são movidas de `backlog/` para `done/` pelo `@pm`, mantendo o link no board atualizado.
- Todas as tasks de Fase 5 (M0–M8) estão bloqueadas até a aprovação da Fase 1 (arquitetura) e conclusão da Fase 2 (setup do projeto) — refletir isso ao liberar cada uma para `Pronta`.
