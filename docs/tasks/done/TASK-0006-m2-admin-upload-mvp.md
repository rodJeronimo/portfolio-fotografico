---
id: TASK-0006
title: "M2 — Admin upload MVP"
milestone: M2
owner: "@backend"
status: Concluida
depends_on: [TASK-0005]
related_docs: [docs/architecture/upload-flow.md, docs/architecture/security.md]
---

# TASK-0006 — M2: Admin upload MVP

## Contexto
Primeira versão funcional do painel: login, CRUD de projetos, upload de foto com metadados, listagem/exclusão.

## Escopo
Telas admin (`@frontend` implementa UI conforme especificação de `@ux-designer`; `@backend` implementa Server Actions), presigned URL para R2, validação de MIME/tamanho, listagem/exclusão de fotos e projetos.

## Critérios de aceite
- [x] Given admin autenticado, When cria um novo projeto, Then o projeto aparece na listagem com slug único. Validado via smoke test real (create+list+delete no Neon).
- [x] Given admin autenticado, When faz upload de uma foto válida (JPEG/PNG/WebP/AVIF, dentro do limite de tamanho), Then a foto é associada ao projeto e listada no admin. Validado via smoke test real (MIME→EXIF→pipeline→R2→DB, ponta a ponta).
- [x] Given arquivo com MIME inválido (magic bytes), When upload é tentado, Then é rejeitado com mensagem clara. Validado (texto puro rejeitado corretamente).
- [x] Given rate limit de upload excedido, When novo upload é tentado, Then é bloqueado com mensagem clara (não erro genérico). Implementado com limiter em memória (placeholder — ver nota abaixo), 4 testes unitários cobrindo janela/reset/isolamento por usuário.
- [x] Exclusão de foto remove metadados do DB (hard delete) e as 5 variantes no R2 (original + thumb/medium × webp/avif).

## Dependências
TASK-0005. UI segue `docs/design/guidelines.md` (seção M2/M3 — validar com `@ux-designer` antes de finalizar).

## Resultado

- **Server Actions**: `src/app/admin/projects/actions.ts` (`createProject`, `deleteProject`), `src/app/admin/fotos/actions.ts` (`requestPhotoUpload` → presigned URL, `confirmPhotoUpload` → valida MIME real, extrai EXIF, processa variantes, grava metadados; `deletePhoto` → remove DB + R2). Todas com `requireAdminSession()` (defesa em profundidade — não dependem só do middleware).
- **UI mínima**: `/admin/projects` (listar + criar, slug auto-gerado do título), `/admin/fotos?projectId=X` (dropzone de upload com progresso, grid de thumbnails, exclusão com confirmação). Design tokens de M0 reaproveitados.
- **Rate limiting**: `src/lib/rate-limit/index.ts` — sliding window em memória (30 req/10min por e-mail), **placeholder documentado** até a conta Upstash existir (bloqueado — usuário sinalizou continuar sem essa conta por ora). Não é distribuído entre instâncias serverless, mas aceitável para operador único. 4 testes unitários.
- **Validação de segurança**: MIME real via magic bytes (`file-type`, não confia em extensão/Content-Type do client), limite de 25MB, presigned URL com expiração de 5min (já era assim desde `src/lib/storage/r2.ts`).
- **Testes unitários**: `src/lib/validations/{project,photo}.test.ts` (9 casos), `src/lib/rate-limit/index.test.ts` (4 casos) — 21 testes no total no repo agora.
- **Smoke test real de integração** (`scripts/smoke-test-upload-pipeline.ts`, `npm run smoke:upload`): roda a pipeline completa (MIME → EXIF → resize/WebP/AVIF/blur → upload R2 → leitura via URL pública → INSERT relacional no Neon → cleanup) contra os serviços reais, sem depender de sessão de navegador (impossível de automatizar). **Passou integralmente.**
- **Correção de bug real**: `/admin/projects` estava sendo pré-renderizada estaticamente pelo Next (sem `searchParams`, sem `dynamic APIs` detectadas) — página administrativa nunca deveria cachear. Corrigido com `export const dynamic = "force-dynamic"`.
- **Pendências**: rate limiting real (Upstash) fica para quando a conta existir — trocar `src/lib/rate-limit/index.ts` por `@upstash/ratelimit` é uma troca isolada (mesma assinatura de retorno). Teste manual do fluxo completo pela UI/navegador ainda não foi feito pelo usuário (só validação via smoke test automatizado).
