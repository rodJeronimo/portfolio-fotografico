# Portfólio Fotográfico

Portfólio pessoal de fotografia de natureza — site de exposição (sem e-commerce), com painel administrativo para upload de fotos sem necessidade de novo deploy.

Stack: [Next.js 15](https://nextjs.org) (App Router) · TypeScript strict · [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) (Postgres serverless) · [Cloudflare R2](https://developers.cloudflare.com/r2/) · [Auth.js v5](https://authjs.dev) (GitHub OAuth) · Tailwind CSS v4 · Vercel.

Decisões arquiteturais documentadas em [`docs/ADR/`](docs/ADR/README.md). Visão geral da arquitetura em [`docs/architecture/`](docs/architecture/overview.md). Board de tasks em [`docs/tasks/BOARD.md`](docs/tasks/BOARD.md).

## Getting Started

```bash
npm install
cp .env.example .env.local   # preencher com credenciais reais (nunca commitar)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run start` | Build e start de produção |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` | Prettier |
| `npm run type-check` | `tsc --noEmit` |
| `npm run test` / `npm run test:watch` | Testes unitários/integração (Vitest) |
| `npm run test:e2e` | Testes e2e (Playwright) |
| `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` | Drizzle Kit |

## Fluxo GitFlow

Branches long-lived: **`main`** (produção) e **`develop`** (integração). Nunca há push direto em `main`.

- **Feature**: `feature/<slug>` a partir de `develop` → PR para `develop` (exige CI verde).
- **Release**: `release/<versao>` a partir de `develop` → PR para `main` (exige PR + 1 review + CI verde) → merge de volta em `develop`.
- **Hotfix**: `hotfix/<slug>` a partir de `main` → merge em `main` **e** em `develop`.

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/). PRs devem incluir descrição, testes, ADRs atualizados (quando aplicável) e screenshots (mudanças de UI).

**Cada task do board (`docs/tasks/`) vira uma branch `feature/TASK-NNNN-slug`** a partir de `develop`, com PR de volta — nunca commit direto, mesmo quando a proteção de branch permitiria.

## CI/CD

Workflows em [`.github/workflows/`](.github/workflows/):

| Workflow | Trigger | O que faz |
|---|---|---|
| `ci.yml` | PR para `develop`/`main` | lint, type-check, test (Vitest + cobertura), build — em paralelo |
| `e2e.yml` | PR para `main` | Playwright contra o preview deploy do PR |
| `preview.yml` | PR aberto/atualizado em `develop` | deploy preview na Vercel + comentário com a URL no PR |
| `release.yml` | push em `main` ou tag `v*` | deploy de produção na Vercel, `gh release create` (em tag), sync automático `main` → `develop` |
| `hotfix.yml` | push em `hotfix/**` | CI completo + deploy de preview emergencial (produção acontece via `release.yml` ao mergear em `main`) |

Secrets necessários no repositório (`Settings > Secrets and variables > Actions`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (ver `docs/tasks/backlog/TASK-0003-deploy-vercel.md`).

## Agentes Claude Code

Este projeto usa subagentes especializados definidos em [`.claude/agents/`](.claude/agents/) (`@pm`, `@arquiteto`, `@ux-designer`, `@frontend`, `@backend`, `@devops`, `@qa`, `@reviewer`) — ver [`.claude/CLAUDE.md`](.claude/CLAUDE.md) para o mapeamento de responsabilidades.

## Licença

MIT — ver [LICENSE](LICENSE).
