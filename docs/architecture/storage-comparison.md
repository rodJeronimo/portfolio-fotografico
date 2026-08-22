# Comparativo — Cloudflare R2 vs UploadThing vs Cloudinary

**Decisão final: Cloudflare R2.** Ver `docs/ADR/0003-cloudflare-r2.md`.

## Critérios avaliados

| Critério | Cloudflare R2 | UploadThing | Cloudinary |
|---|---|---|---|
| Egress (bandwidth) | **Zero egress fee** — decisivo para um portfólio de fotos, onde tráfego de imagem é o maior custo variável | Egress limitado no free tier, cobrado depois | Egress consumido do pool de créditos |
| Free tier | 10GB storage, 10M leituras Classe A/mês | ~2GB storage | 25 créditos/mês (storage+transform+bandwidth combinados) |
| Modelo de custo | Previsível (storage + operações, sem egress) | Previsível mas tier pequeno | Baseado em créditos combinados — pode esgotar rápido com muitas variantes de imagem |
| Transforms on-the-fly | Não nativo (Cloudflare Images é produto separado, pago) — otimização feita no upload via `sharp` | Não — precisa de `sharp` de qualquer forma | Sim, via URL params — reduz pipeline próprio |
| Integração `next/image` | Via loader customizado apontando para domínio público do bucket (custom domain + Cloudflare Image Resizing opcional) | Componentes prontos, mas acopla fluxo de upload ao vendor | Loader oficial `next/image` mantido pela Cloudinary |
| API | S3-compatible (SDK padrão `@aws-sdk/client-s3`, presigned URLs) | SDK próprio, menos portável | SDK próprio |
| Portabilidade | Alta (S3-compatible, pode trocar por outro provedor S3 com baixo atrito) | Baixa (acopla storage + upload UI ao vendor) | Média |
| Latência no Brasil | Boa via Cloudflare CDN global (PoPs no Brasil) | Depende do backend deles (geralmente AWS) | Boa (Cloudinary tem CDN global) |
| Complexidade operacional | Requer implementar presigned URL flow + pipeline `sharp` próprio | Menor esforço inicial (SDK cuida do upload) | Menor esforço no pipeline (transforms via URL) |

## Por que não UploadThing

DX simples, mas o free tier (2GB) é pequeno para um portfólio que cresce com fotos em alta resolução, e o acoplamento do fluxo de upload ao vendor reduz portabilidade. Ainda exigiria `sharp` para gerar variantes, então não elimina a complexidade que R2 também tem.

## Por que não Cloudinary

Os transforms on-the-fly são atraentes (menos pipeline próprio), mas o modelo de créditos combinados (storage + transform + bandwidth) é imprevisível a longo prazo — um portfólio em crescimento pode esgotar o free tier rapidamente só com visitas gerando transforms diferentes. R2 com egress zero é mais previsível para escalar sem custo surpresa.

## Decisão

**Cloudflare R2** + pipeline de otimização própria via `sharp` no momento do upload (Server Action), servindo via `next/image` com loader customizado apontando para o domínio público do bucket (ou Cloudflare Image Resizing como upgrade futuro opcional).
