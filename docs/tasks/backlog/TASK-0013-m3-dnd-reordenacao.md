---
id: TASK-0013
title: "M3 (follow-up) — Reordenação drag-and-drop de fotos"
milestone: M3
owner: "@frontend"
status: Em revisao
depends_on: [TASK-0007]
related_docs: [docs/architecture/upload-flow.md, docs/design/guidelines.md]
---

# TASK-0013 — Reordenação drag-and-drop de fotos

## Contexto
Extraída da TASK-0007: a lógica de backend (schema `project_photo.display_order`, cálculo de ordem inicial no upload) já existe. Falta a interação de arrastar-e-soltar no admin para reordenar manualmente.

## Escopo
UI de drag-and-drop na listagem de fotos do projeto (`/admin/fotos`), persistindo a nova ordem via Server Action (`updatePhotoOrder` ou similar), com `revalidatePath` para refletir na galeria pública quando M4 existir.

## Critérios de aceite
- [x] Given admin arrasta uma foto para nova posição, When solta, Then a ordem visual é atualizada imediatamente (otimista) e persistida no banco. `onDragStart`/`onDrop` nativos (sem lib extra) + `useState` local para update otimista.
- [x] Given a página é recarregada, When a listagem é buscada, Then reflete a ordem salva (não a ordem de upload original). `updatePhotoOrder` grava `display_order = índice na lista final`; página consulta ordenado por `display_order`.
- [x] Acessível via teclado (alternativa ao mouse) — requisito de a11y do checklist de `@ux-designer`. Botões explícitos "↑"/"↓" (`aria-label="Mover para cima/baixo"`) — decisão deliberada de não tentar tornar o drag nativo operável por teclado (notoriamente difícil sem lib dedicada) e sim oferecer um controle equivalente.
- [x] Testado com `@qa` (unitário na Server Action de update de ordem; e2e opcional). Smoke test real contra Neon (não unitário com mock) — ver Resultado.

## Dependências
TASK-0007 (schema e cálculo de ordem inicial já prontos).

## Resultado

- **`updatePhotoOrder(projectId, orderedPhotoIds)`** (`src/app/admin/fotos/actions.ts`): recebe a lista completa de IDs na ordem final, grava `display_order = index` via `UPDATE ... WHERE projectId AND photoId` para cada item, revalida `/admin/fotos` + rotas públicas do projeto.
- **`PhotoReorderList`** (`src/app/admin/fotos/photo-reorder-list.tsx`): substitui o grid estático anterior. Drag-and-drop nativo (`draggable`, `onDragStart`/`onDragOver`/`onDrop`) sem biblioteca externa — decisão deliberada de manter dependências enxutas para uma interação relativamente simples (lista linear, sem drag entre grupos/containers). Botões de mover para cima/baixo cobrem o caso de teclado. Exclusão de foto também migrada pra dentro deste componente (substituindo `DeletePhotoButton`, agora removido — redundante).
- **Validação real**: como Server Actions com `requireAdminSession()` não são chamáveis fora do contexto de uma requisição Next.js autenticada, a lógica de persistência foi validada replicando exatamente a query da action contra um projeto+3 fotos reais no Neon — ordem invertida gravada e lida de volta corretamente, depois limpa.
- **Pendência**: teste e2e real via navegador (arrastar de fato) não foi feito — não automatizável sem Playwright configurado para simular drag events reais (fora do escopo desta task; candidato para TASK-0012, M8).
