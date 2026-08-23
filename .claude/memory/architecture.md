# Memória — Arquitetura

Visão completa: `docs/architecture/overview.md`. Decisões formais: `docs/ADR/README.md`.

## Decisões estruturais chave
- **DB: Neon (Postgres)** — ADR-0002. Modelo N:N forte (Project↔Photo), branching de DB, integração nativa Vercel.
- **Storage: Cloudflare R2** — ADR-0003. Egress zero (decisivo p/ tráfego de fotos), pipeline `sharp` próprio no upload (sem transform on-the-fly).
- **Auth: Auth.js v5, GitHub OAuth, JWT session, allowlist `ADMIN_EMAILS`** — ADR-0004. Sem tabela de usuários/roles.
- **GitFlow clássico** — ADR-0005. `main`/`develop` long-lived; **cada task do board vira `feature/TASK-NNNN-slug` → PR → develop** (nunca commit direto, mesmo quando a proteção de branch permitiria).

## Modelo de dados (`docs/architecture/data-model.md`, schema em `src/db/schema.ts`)
`project` (slug único, cover_photo_id) · `photo` (storage_key único, exif_json sanitizado, blur_data_url, width/height) · `project_photo` (N:N, PK composta, cascade) · `site_settings` (key+locale).

## Estrutura de pastas
Projeto usa `--src-dir`: tudo em `src/` (`app/`, `lib/`, `components/`, `db/`, `middleware.ts`). `drizzle/` só migrations geradas. `docs/`, `.claude/`, `tests/` na raiz. Route groups `(public)/[locale]` e `(admin)/admin` **ainda não criados** — deliberadamente adiados até as rotas reais existirem (M1/M4).

## Infra provisionada até agora
- **GitHub**: repo `rodJeronimo/portfolio-fotografico` (era `portifolio-fotografico`, renomeado). `main` protegida (1 review, sem push/force/delete direto), `develop` sem force/delete. CODEOWNERS aponta tudo para `@rodJeronimo` com anotação de agente dono.
- **CI/CD**: `.github/workflows/{ci,e2e,preview,release,hotfix}.yml` — todos validados funcionando de ponta a ponta.
- **Vercel**: projeto `rodjeronimo/portfolio-fotografico` linkado. **Gotcha importante**: token da conta é escopado a **Team**, então `vercel whoami`/`pull`/`build --prebuilt` falham (`User not found`) — usar sempre `vercel deploy` simples (build remoto). Detalhado em `docs/architecture/deploy-vercel.md`.
- **Ainda não existem**: conta Neon, bucket R2, GitHub OAuth App, conta Upstash — bloqueiam TASK-0005+ até serem criadas pelo usuário.

## Pendências conhecidas
- `required_status_checks` de `main`/`develop` ainda não referencia os jobs do CI (ajustar quando fizer sentido).
- Env vars reais de produção/preview na Vercel ainda não configuradas (dependem das contas acima).
