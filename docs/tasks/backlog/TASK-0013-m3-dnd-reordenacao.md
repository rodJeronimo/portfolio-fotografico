---
id: TASK-0013
title: "M3 (follow-up) — Reordenação drag-and-drop de fotos"
milestone: M3
owner: "@frontend"
status: Backlog
depends_on: [TASK-0007]
related_docs: [docs/architecture/upload-flow.md, docs/design/guidelines.md]
---

# TASK-0013 — Reordenação drag-and-drop de fotos

## Contexto
Extraída da TASK-0007: a lógica de backend (schema `project_photo.display_order`, cálculo de ordem inicial no upload) já existe. Falta a interação de arrastar-e-soltar no admin para reordenar manualmente.

## Escopo
UI de drag-and-drop na listagem de fotos do projeto (`/admin/fotos`), persistindo a nova ordem via Server Action (`updatePhotoOrder` ou similar), com `revalidatePath` para refletir na galeria pública quando M4 existir.

## Critérios de aceite
- [ ] Given admin arrasta uma foto para nova posição, When solta, Then a ordem visual é atualizada imediatamente (otimista) e persistida no banco.
- [ ] Given a página é recarregada, When a listagem é buscada, Then reflete a ordem salva (não a ordem de upload original).
- [ ] Acessível via teclado (alternativa ao mouse) — requisito de a11y do checklist de `@ux-designer`.
- [ ] Testado com `@qa` (unitário na Server Action de update de ordem; e2e opcional).

## Dependências
TASK-0007 (schema e cálculo de ordem inicial já prontos).

## Resultado
*(a preencher)*
