---
id: TASK-0003
title: Configuração de deploy na Vercel
milestone: Fase4
owner: "@devops"
status: Bloqueada
depends_on: [TASK-0001]
related_docs: [docs/architecture/deploy-vercel.md, docs/architecture/caching-strategy.md]
---

# TASK-0003 — Configuração de deploy na Vercel

## Contexto
Fase 4 do plano: preparar o projeto na Vercel (stack fixa) com configuração de cache/headers, preview deployments e estratégia de rollback.

## Escopo
Checklist de config Vercel (framework preset, build command, output dir, env vars, domínios), `vercel.json` (headers de cache, redirects, ISR se necessário), estratégia de preview deployments por branch/PR, limites do tier free e alertas de cota, estratégia de rollback.

## Critérios de aceite
- [ ] Projeto conectado à Vercel com env vars configuradas (sem segredos commitados). **Bloqueado**: requer `vercel login` interativo (navegador) do usuário.
- [x] `vercel.json` presente e validado (headers de cache para assets estáticos/imagens + segurança básica).
- [x] Documentado como fazer rollback (CLI e dashboard) em `docs/architecture/deploy-vercel.md`.
- [x] Limites do tier free (build minutes, bandwidth, function execution) documentados com gatilho de alerta.

## Dependências
TASK-0001.

## Resultado

- **Entregue nesta task**: `vercel.json` (headers de cache imutável para `/_next/static/*` e imagens estáticas, headers de segurança básicos), `docs/architecture/deploy-vercel.md` (checklist completo, estratégia de preview, limites de tier free, rollback).
- **Bloqueado — requer ação do usuário**: `vercel login` e `vercel link` são interativos (autenticação via navegador), não podem ser executados por um agente. Passo a passo documentado em `docs/architecture/deploy-vercel.md`.
- **Consequência da pendência**: os secrets `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` (necessários para os jobs de deploy de `preview.yml`/`release.yml`/`hotfix.yml`, TASK-0002) continuam ausentes até o usuário completar o login/link e cadastrar os secrets no GitHub.
- **Próximos passos quando o usuário retomar**: `npx vercel login` → `npx vercel link` → copiar `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` de `.vercel/project.json` → gerar `VERCEL_TOKEN` → cadastrar os 3 secrets no GitHub (`gh secret set`) → configurar env vars reais na Vercel.
- Task mantida como **Bloqueada** no board até essa ação externa ser concluída.
