---
id: TASK-0007
title: "M3 — Pipeline de imagens: otimização, LQIP, ordenação"
milestone: M3
owner: "@backend"
status: Concluida
depends_on: [TASK-0006]
related_docs: [docs/architecture/upload-flow.md, docs/architecture/security.md]
---

# TASK-0007 — M3: Pipeline de imagens

## Contexto
Otimização automática das fotos enviadas: variantes WebP/AVIF, thumbnails, LQIP blur, e reordenação drag-and-drop no admin.

## Escopo
`lib/image-pipeline/` (`sharp`: resize, WebP/AVIF, LQIP, sanitização de EXIF), `next/image` configurado com loader customizado para R2, drag-and-drop de ordem em `project_photo.display_order` (UI de `@frontend`, persistência de `@backend`).

## Critérios de aceite
- [x] Given upload de foto original, When processada, Then existem variantes thumbnail/medium em WebP e AVIF gravadas no R2. Validado via smoke test real (4 variantes confirmadas no bucket).
- [x] Given foto processada, When exibida no site público, Then usa `blurDataURL` como placeholder até carregar. `blurDataUrl` gerado (base64 inline, sem round-trip ao R2) e persistido em `photo.blur_data_url` — consumo real no `<Image>` fica para M4 (galeria pública ainda não existe).
- [x] Given EXIF do arquivo original, When sanitizado, Then GPS é removido e apenas campos whitelisted (câmera, lente, ISO, etc.) são persistidos. Implementado com `exifr` + whitelist explícita (câmera, lente, abertura, ISO, velocidade, data) — GPS nunca é lido (nem está na lista `pick`).
- [x] Given admin reordena fotos via drag-and-drop, When salva, Then `display_order` é persistido e refletido na galeria pública após revalidação. **Implementado em TASK-0013** (extraída desta task).

## Dependências
TASK-0006.

## Resultado

- **`src/lib/image-pipeline/process.ts`**: `processAndUploadVariants(buffer, storageKey)` — gera thumbnail (400px) e medium (1600px), cada um em WebP (qualidade 80) e AVIF (qualidade 60), grava direto no R2 com `Cache-Control: public, max-age=31536000, immutable` (conforme `docs/architecture/caching-strategy.md`). Gera também blur placeholder 16px em WebP inline base64. Preserva orientação EXIF (`.rotate()`) antes de qualquer resize.
- **`src/lib/image-pipeline/exif.ts`**: `extractSanitizedExif(buffer)` via `exifr`, com `pick` explícito (Make, Model, LensModel, FNumber, ISO, ExposureTime, DateTimeOriginal) — GPS nunca é solicitado ao parser, muito menos persistido. Retorna objeto tipado `SanitizedExif` ou `null`.
- **Validado via smoke test real** (`npm run smoke:upload`): variantes confirmadas fisicamente no bucket R2 (thumb.webp acessível via URL pública, `content-type: image/webp`, HTTP 200), `blurDataUrl` gerado corretamente, EXIF de imagem sintética (sem metadados) retorna `null` como esperado.
- **`next/image` para R2**: resolvido em TASK-0008 via prop `unoptimized` (não um loader customizado) — as variantes já vêm pré-otimizadas do pipeline desta task, então o otimizador da Vercel seria redundante.
- **Reordenação drag-and-drop**: implementada em TASK-0013.
- **Ordem inicial correta**: `confirmPhotoUpload` (TASK-0006) já calcula `display_order` incremental via `MAX(display_order) + 1` por projeto, então a ordem de upload é preservada mesmo sem UI de reordenação manual ainda.
