---
id: TASK-0003
title: Configuração de deploy na Vercel
milestone: Fase4
owner: "@devops"
status: Backlog
depends_on: [TASK-0001]
related_docs: []
---

# TASK-0003 — Configuração de deploy na Vercel

## Contexto
Fase 4 do plano: preparar o projeto na Vercel (stack fixa) com configuração de cache/headers, preview deployments e estratégia de rollback.

## Escopo
Checklist de config Vercel (framework preset, build command, output dir, env vars, domínios), `vercel.json` (headers de cache, redirects, ISR se necessário), estratégia de preview deployments por branch/PR, limites do tier free e alertas de cota, estratégia de rollback.

## Critérios de aceite
- [ ] Projeto conectado à Vercel com env vars configuradas (sem segredos commitados).
- [ ] `vercel.json` presente e validado (headers de cache para imagens/páginas conforme `docs/architecture/caching-strategy.md`).
- [ ] Documentado como fazer rollback (CLI ou dashboard).
- [ ] Limites do tier free (build minutes, bandwidth, function execution) documentados com gatilho de alerta.

## Dependências
TASK-0001.

## Resultado
*(a preencher)*
