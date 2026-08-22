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
- **Pendência real**: env vars de produção/preview no projeto Vercel ainda não configuradas — dependem de contas que ainda não existem (Neon, Cloudflare R2, GitHub OAuth App, Upstash Redis), a serem criadas ao longo de TASK-0005 (M1) e TASK-0007 (M3). Task permanece **Em andamento** até essa configuração final.
- **Validação real do pipeline**: adiada para o próximo PR aberto (evita reexpor o token em comandos locais visíveis na sessão) — `preview.yml` deve rodar com sucesso assim que o próximo PR for aberto contra `develop`.
