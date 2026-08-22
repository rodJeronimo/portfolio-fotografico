---
id: TASK-0007
title: "M3 — Pipeline de imagens: otimização, LQIP, ordenação"
milestone: M3
owner: "@backend"
status: Backlog
depends_on: [TASK-0006]
related_docs: [docs/architecture/upload-flow.md, docs/architecture/security.md]
---

# TASK-0007 — M3: Pipeline de imagens

## Contexto
Otimização automática das fotos enviadas: variantes WebP/AVIF, thumbnails, LQIP blur, e reordenação drag-and-drop no admin.

## Escopo
`lib/image-pipeline/` (`sharp`: resize, WebP/AVIF, LQIP, sanitização de EXIF), `next/image` configurado com loader customizado para R2, drag-and-drop de ordem em `project_photo.display_order` (UI de `@frontend`, persistência de `@backend`).

## Critérios de aceite
- [ ] Given upload de foto original, When processada, Then existem variantes thumbnail/medium em WebP e AVIF gravadas no R2.
- [ ] Given foto processada, When exibida no site público, Then usa `blurDataURL` como placeholder até carregar.
- [ ] Given EXIF do arquivo original, When sanitizado, Then GPS é removido e apenas campos whitelisted (câmera, lente, ISO, etc.) são persistidos.
- [ ] Given admin reordena fotos via drag-and-drop, When salva, Then `display_order` é persistido e refletido na galeria pública após revalidação.

## Dependências
TASK-0006.

## Resultado
*(a preencher)*
