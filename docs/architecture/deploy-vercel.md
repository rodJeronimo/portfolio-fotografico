# Deploy — Vercel

## Checklist de configuração do projeto

Passos a serem executados **pelo usuário** (`vercel login` exige autenticação interativa via navegador — não pode ser feito por um agente):

1. `npx vercel login` — autenticar com a conta que vai hospedar o projeto.
2. Na raiz do repo: `npx vercel link` — conecta o diretório local ao projeto Vercel (cria um projeto novo se ainda não existir, nome sugerido: `portfolio-fotografico`).
3. **Framework preset**: `Next.js` (detectado automaticamente a partir de `vercel.json` + `package.json`).
4. **Build command**: `npm run build` (já declarado em `vercel.json`).
5. **Install command**: `npm ci` (já declarado em `vercel.json`).
6. **Output directory**: padrão do preset Next.js (não precisa configurar manualmente).
7. **Env vars**: configurar em `Project Settings > Environment Variables` todas as chaves de `.env.example`, separadas por ambiente (Production / Preview / Development conforme necessário):
   - `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_EMAILS`, `STORAGE_R2_*`, `UPSTASH_REDIS_REST_*`, `NEXT_PUBLIC_SITE_URL`.
   - Recomendado: usar a **Neon Vercel Integration** (marketplace) para `DATABASE_URL` — provisiona branch de DB por ambiente automaticamente (ver `docs/ADR/0002-neon-postgres.md`).
8. **Domínio**: adicionar domínio customizado em `Project Settings > Domains` quando disponível; até lá, usar o domínio `*.vercel.app` gerado.
9. **Secrets para o GitHub Actions** (`Settings > Secrets and variables > Actions` no repositório GitHub, não na Vercel):
   - `VERCEL_TOKEN` — gerado em `https://vercel.com/account/tokens`.
   - `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` — obtidos em `.vercel/project.json` após rodar `vercel link` localmente uma vez.

Esses três secrets são consumidos pelos workflows `preview.yml`, `release.yml` e `hotfix.yml` (`docs/tasks/backlog/TASK-0002-pipeline-cicd.md`) — sem eles, os jobs de deploy falham (o restante do CI — lint/type-check/test/build — funciona independentemente).

### Nota — token escopado a Team

Quando a conta Vercel é organizada como **Team** (caso deste projeto — `rodjeronimo`), o token gerado em `/account/tokens` é escopado ao time, não à conta pessoal. Isso quebra `vercel whoami`, `vercel pull` e `vercel build --prebuilt` com erros como `User not found` ou `Could not retrieve Project Settings`, mesmo com o token e os IDs corretos — são comandos que dependem de resolver identidade de usuário pessoal antes de prosseguir. **`vercel deploy` (sem `pull`/`build --prebuilt`, deixando a Vercel buildar remotamente) funciona normalmente** com token de time e é o que os workflows deste projeto usam. Se no futuro for necessário usar `pull`/`build --prebuilt` (ex.: para inspecionar env vars localmente), gerar o token a partir de uma conta pessoal (não-Team) ou investigar permissões de escopo do token no dashboard.

## `vercel.json`

Ver arquivo na raiz do repo. Configura:
- `framework: "nextjs"`, `buildCommand`, `installCommand`.
- Headers de cache imutável para assets estáticos do Next (`/_next/static/*`) e para imagens servidas do próprio domínio Vercel (arquivos em `public/`) — as fotos do portfólio em si são servidas pelo domínio público do Cloudflare R2, com cache configurado no próprio bucket/CDN (ver `docs/architecture/caching-strategy.md`), não pela Vercel.
- Headers de segurança básicos (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

## Estratégia de Preview Deployments

- Um preview por PR aberto contra `develop` (`preview.yml`, TASK-0002) — a Vercel também gera preview automaticamente para qualquer branch conectada via a integração nativa GitHub↔Vercel, mas o fluxo oficial deste projeto é o job do `preview.yml` (permite controlar exatamente quando/como o comentário com a URL é postado no PR).
- PRs contra `main` (release/hotfix) usam o preview mais recente do commit para os testes e2e (`e2e.yml`).

## Limites do tier free e alertas de cota

| Recurso | Limite (Hobby/free) | Ação recomendada ao se aproximar |
|---|---|---|
| Build minutes | 6.000 min/mês | Monitorar em `Vercel Dashboard > Usage`; se necessário, reduzir frequência de preview builds redundantes |
| Bandwidth | 100 GB/mês | Como as fotos são servidas pelo R2 (não pela Vercel), o consumo de bandwidth da Vercel deve ficar baixo (só HTML/JS/CSS) — monitorar mesmo assim |
| Function execution (Server Actions/Route Handlers) | 100 GB-horas/mês | Monitorar tempo de execução do pipeline `sharp` no upload (é o Server Action mais pesado) |
| Domínios/projetos | Sem custo adicional no Hobby para 1 projeto pessoal | — |

Alertas de cota são configuráveis em `Vercel Dashboard > Settings > Billing`. Se o projeto crescer além do tier free, o plano Pro remove a maioria desses limites.

## Estratégia de rollback

- **Via dashboard**: `Deployments` → selecionar um deployment de produção anterior → `Promote to Production` (instantâneo, sem rebuild).
- **Via CLI**: `npx vercel rollback [url-ou-deployment-id]`.
- Como o pipeline de release (`release.yml`) faz deploy a cada push/tag em `main`, cada deployment de produção fica no histórico da Vercel e pode ser promovido a qualquer momento — não depende de reverter commits no Git para reverter o site publicado (embora reverter o commit em `main` seja a forma correta de tornar o rollback permanente no próximo deploy).
