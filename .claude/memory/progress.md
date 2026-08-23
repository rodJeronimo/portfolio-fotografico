# Memória — Progresso (snapshot)

Fonte completa e sempre atual: `docs/tasks/BOARD.md`. Este arquivo é um snapshot rápido, pode ficar levemente desatualizado — confira o board para o estado real.

## Concluído
- Fase 0 (agentes), Fase 1 (arquitetura/ADRs), Fase 2 (setup projeto + GitFlow + GitHub).
- TASK-0001, TASK-0002, TASK-0004: setup, CI/CD, M0 (fundação de design).
- Vercel: projeto linkado, secrets configurados, pipeline de deploy validado ponta a ponta (preview + comentário automático no PR), env vars **placeholder** cadastradas (Preview+Production) para builds não quebrarem.
- **TASK-0005 (M1 — DB e Auth) mesclada**: Auth.js v5 (GitHub, JWT, allowlist), `middleware.ts` real, migration inicial gerada (`drizzle/0000_low_khan.sql`), 8 testes unitários da allowlist. **Código pronto, mas não validado end-to-end** (sem conta Neon real nem GitHub OAuth App real).

## Bloqueado — precisa do usuário para desbloquear
Nesta ordem, cada um desbloqueia validação real de tasks já com código pronto:
1. **Conta Neon** → `DATABASE_URL` real → aplicar `npm run db:migrate` → valida TASK-0005 de fato.
2. **GitHub OAuth App** (`github.com/settings/developers`, callback `.../api/auth/callback/github`) → `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` → valida login real (allow/deny) de TASK-0005.
3. **Cloudflare R2** (bucket + credenciais S3-compatible) → necessário para TASK-0006/M2 (upload) e TASK-0007/M3 (pipeline de imagens) terem qualquer validação real.
4. **Upstash Redis** → rate limiting do upload (TASK-0006), menos urgente que R2.

Sem essas contas, dá pra continuar escrevendo código (Server Actions, UI, schema) mas **sem conseguir validar nada de ponta a ponta** — risco de acumular erros não detectados. Recomendação: pausar implementação pesada de M2/M3 até pelo menos Neon+GitHub OAuth App existirem.

## Backlog (ordem prevista)
TASK-0006 (M2 admin upload, precisa R2) → TASK-0007 (M3 pipeline imagens, precisa R2+Upstash) → TASK-0008 (M4 galeria pública) → TASK-0009 (M5 sobre/contato) → TASK-0010 (M6 SEO) → TASK-0011 (M7 polish) → TASK-0012 (M8 e2e/hardening).
