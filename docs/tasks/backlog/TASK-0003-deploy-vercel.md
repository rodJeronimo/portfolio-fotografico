---
id: TASK-0003
title: Configuração de deploy na Vercel
milestone: Fase4
owner: "@devops"
status: Em andamento
depends_on: [TASK-0001]
related_docs: [docs/architecture/deploy-vercel.md, docs/architecture/caching-strategy.md]
---

# TASK-0003 — Configuração de deploy na Vercel

## Contexto
Fase 4 do plano: preparar o projeto na Vercel (stack fixa) com configuração de cache/headers, preview deployments e estratégia de rollback.

## Escopo
Checklist de config Vercel (framework preset, build command, output dir, env vars, domínios), `vercel.json` (headers de cache, redirects, ISR se necessário), estratégia de preview deployments por branch/PR, limites do tier free e alertas de cota, estratégia de rollback.

## Critérios de aceite
- [x] Projeto criado e linkado na Vercel (`rodjeronimo/portfolio-fotografico`), secrets `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` cadastrados no GitHub Actions.
- [ ] Env vars reais (`DATABASE_URL`, `AUTH_*`, `STORAGE_R2_*`, `UPSTASH_*`) configuradas no projeto Vercel — depende das contas Neon/R2/GitHub OAuth/Upstash ainda não criadas (TASK-0005+).
- [x] `vercel.json` presente e validado (headers de cache para assets estáticos/imagens + segurança básica).
- [x] Documentado como fazer rollback (CLI e dashboard) em `docs/architecture/deploy-vercel.md`.
- [x] Limites do tier free (build minutes, bandwidth, function execution) documentados com gatilho de alerta.

## Dependências
TASK-0001.

## Resultado

- **Entregue**: `vercel.json`, `docs/architecture/deploy-vercel.md`, projeto `rodjeronimo/portfolio-fotografico` criado e linkado (`vercel link`), 3 secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) cadastrados no GitHub via `gh secret set` — jobs de deploy de `preview.yml`/`release.yml`/`hotfix.yml` (TASK-0002) agora têm o que precisam para rodar.
- **Pendência conhecida, não bloqueante**: a "Login Connection" da conta Vercel do usuário com o GitHub falhou durante o `vercel link` (`Failed to link... You need to add a Login Connection to your GitHub account first`) — não impede nosso pipeline (que usa o token da CLI via GitHub Actions, não a integração nativa Git da Vercel), mas vale conectar em `vercel.com/account/login-connections` para habilitar recursos nativos da Vercel (comentários de PR automáticos, status checks nativos) como complemento opcional ao `preview.yml`.
- **Env vars placeholder configuradas** (via API REST — `vercel env add` sofre da mesma limitação de token Team que `pull`/`build`): as 13 chaves de `.env.example` cadastradas em Preview+Production no projeto Vercel com valores placeholder, para os builds de `preview.yml`/`release.yml` não quebrarem por `env.ts` (Zod) rejeitar valores ausentes. **Ainda pendente**: substituir pelos valores reais assim que Neon/R2/GitHub OAuth App/Upstash existirem (TASK-0005/TASK-0007) — buscar em `Vercel Dashboard > Project Settings > Environment Variables`. Task permanece **Em andamento** até essa substituição final.
- **Bug real encontrado e corrigido**: o primeiro token gerado retornava `User not found` tanto no CI quanto testado diretamente contra `api.vercel.com` — não era erro de digitação, era um token de conta **Team** (não pessoal), que quebra `vercel whoami`/`vercel pull`/`vercel build --prebuilt` (dependem de resolver identidade de usuário pessoal) mas funciona normalmente com `vercel deploy` simples (build remoto na própria Vercel). `preview.yml`/`release.yml`/`hotfix.yml` reescritos para usar esse caminho. Documentado em `docs/architecture/deploy-vercel.md`.
- **Bug real #2**: `actions/github-script` comentando a URL do preview no PR falhava com `403 Resource not accessible by integration` — `GITHUB_TOKEN` do job sem `pull-requests: write` (padrão read-only do repo). Corrigido com bloco `permissions` no job.
- **Validação real do pipeline**: confirmada em produção — deploy manual (`https://portfolio-fotografico-eta.vercel.app`, HTTP 200) e via CI no PR #4 (`Deploy preview (Vercel)` verde, comentário `🔗 Preview deployado: ...` postado automaticamente no PR).
- **`DATABASE_URL` real configurada** (TASK-0005): substituída via API REST, primeira env var placeholder a virar real. Faltam `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`/`AUTH_SECRET` (TASK-0005) e `STORAGE_R2_*`/`UPSTASH_*` (TASK-0007).
