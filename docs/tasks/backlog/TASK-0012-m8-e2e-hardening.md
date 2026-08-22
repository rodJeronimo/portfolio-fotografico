---
id: TASK-0012
title: "M8 — Testes e2e e hardening final"
milestone: M8
owner: "@qa"
status: Backlog
depends_on: [TASK-0011]
related_docs: [docs/architecture/security.md]
---

# TASK-0012 — M8: Testes e2e e hardening final

## Contexto
Cobertura e2e dos fluxos críticos e revisão final de segurança antes de considerar o produto pronto para uso real.

## Escopo
Playwright cobrindo upload → exibição pública, rate limiting, revisão OWASP (`@qa` + apoio de `@reviewer`).

## Critérios de aceite
- [ ] Teste e2e cobre: login admin → upload de foto → foto aparece na galeria pública em <60s.
- [ ] Teste e2e valida bloqueio por rate limit no upload.
- [ ] Teste e2e valida navegação por teclado no lightbox (setas, ESC).
- [ ] Checklist OWASP Top 10 revisado sem itens críticos abertos.
- [ ] Todos os critérios de aceite das tasks M0–M7 confirmados como atendidos (auditoria final).

## Dependências
TASK-0011 e, transitivamente, todas as tasks de milestone anteriores.

## Resultado
*(a preencher)*
