# Memória — Progresso (snapshot)

Fonte completa e sempre atual: `docs/tasks/BOARD.md`. Este arquivo é um snapshot rápido, pode ficar levemente desatualizado — confira o board para o estado real.

## Concluído
- Fase 0 (agentes), Fase 1 (arquitetura/ADRs), Fase 2 (setup projeto + GitFlow + GitHub).
- TASK-0001, TASK-0002, TASK-0004: setup, CI/CD, M0 (fundação de design).
- Vercel: projeto linkado, secrets configurados, pipeline de deploy validado ponta a ponta (preview + comentário automático no PR).
- **TASK-0005 (M1 — DB e Auth) concluída e validada de ponta a ponta**: Neon real provisionado e migrado (4 tabelas), Auth.js v5 (GitHub, JWT, allowlist), `middleware.ts` real, GitHub OAuth App criado, **login real confirmado pelo usuário em produção**.

## Bloqueado — precisa do usuário para desbloquear
1. ~~Conta Neon~~ ✅
2. ~~GitHub OAuth App~~ ✅ — login validado em produção.
3. **Cloudflare R2** (bucket + credenciais S3-compatible) → necessário para TASK-0006/M2 (upload) e TASK-0007/M3 (pipeline de imagens) terem qualquer validação real. **Próximo passo.**
4. **Upstash Redis** → rate limiting do upload (TASK-0006), menos urgente que R2.

## Padrão que se repetiu 3x — útil saber de antemão
Toda vez que uma env var real substitui um placeholder: (1) atualizar `.env.local`, (2) atualizar via API REST na Vercel (`vercel env add` não funciona com token Team — usar `PATCH /v9/projects/{id}/env/{envId}?teamId=...`), (3) **redeploy manual** (`vercel deploy --prod`) — mudança de env var não afeta deployments já publicados.

## Backlog (ordem prevista)
TASK-0006 (M2 admin upload, precisa R2) → TASK-0007 (M3 pipeline imagens, precisa R2+Upstash) → TASK-0008 (M4 galeria pública) → TASK-0009 (M5 sobre/contato) → TASK-0010 (M6 SEO) → TASK-0011 (M7 polish) → TASK-0012 (M8 e2e/hardening).
