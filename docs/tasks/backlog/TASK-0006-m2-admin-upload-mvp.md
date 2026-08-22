---
id: TASK-0006
title: "M2 — Admin upload MVP"
milestone: M2
owner: "@backend"
status: Backlog
depends_on: [TASK-0005]
related_docs: [docs/architecture/upload-flow.md, docs/architecture/security.md]
---

# TASK-0006 — M2: Admin upload MVP

## Contexto
Primeira versão funcional do painel: login, CRUD de projetos, upload de foto com metadados, listagem/exclusão.

## Escopo
Telas admin (`@frontend` implementa UI conforme especificação de `@ux-designer`; `@backend` implementa Server Actions), presigned URL para R2, validação de MIME/tamanho, listagem/exclusão de fotos e projetos.

## Critérios de aceite
- [ ] Given admin autenticado, When cria um novo projeto, Then o projeto aparece na listagem com slug único.
- [ ] Given admin autenticado, When faz upload de uma foto válida (JPEG/PNG/WebP/AVIF, dentro do limite de tamanho), Then a foto é associada ao projeto e listada no admin.
- [ ] Given arquivo com MIME inválido (magic bytes), When upload é tentado, Then é rejeitado com mensagem clara.
- [ ] Given rate limit de upload excedido, When novo upload é tentado, Then é bloqueado com mensagem clara (não erro genérico).
- [ ] Exclusão de foto remove metadados do DB (variantes no R2 tratadas conforme decisão de `@backend`, documentar se há hard delete ou soft delete).

## Dependências
TASK-0005. UI segue `docs/design/guidelines.md` (seção M2/M3 — validar com `@ux-designer` antes de finalizar).

## Resultado
*(a preencher)*
