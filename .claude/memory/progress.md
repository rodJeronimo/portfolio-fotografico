# Memória — Progresso (snapshot)

Fonte completa e sempre atual: `docs/tasks/BOARD.md`. Este arquivo é um snapshot rápido, pode ficar levemente desatualizado — confira o board para o estado real.

## Concluído
- Fase 0 (agentes), Fase 1 (arquitetura/ADRs), Fase 2 (setup projeto + GitFlow + GitHub).
- TASK-0001 a TASK-0004: setup, CI/CD, M0 (fundação de design).
- Vercel: projeto linkado, secrets configurados, pipeline de deploy validado ponta a ponta (preview + comentário automático no PR).

## Em andamento / próximo
- **TASK-0003**: falta só configurar env vars reais na Vercel (depende de contas ainda não criadas).
- **TASK-0005 (M1 — DB e Auth)**: próxima. Vai precisar de:
  - Conta **Neon** (DB real) → `DATABASE_URL`.
  - **GitHub OAuth App** → `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`.
  - Essas duas são ações do usuário (criação de conta/app externo) — não dá pra fazer por automação sem credenciais.

## Backlog (ordem prevista)
TASK-0006 (M2 admin upload) → TASK-0007 (M3 pipeline imagens, precisa de conta R2 + Upstash) → TASK-0008 (M4 galeria pública) → TASK-0009 (M5 sobre/contato) → TASK-0010 (M6 SEO) → TASK-0011 (M7 polish) → TASK-0012 (M8 e2e/hardening).
