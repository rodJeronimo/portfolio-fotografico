# ADR-0003: Storage/CDN — Cloudflare R2

## Status
Aceito

## Contexto
Precisamos armazenar e servir publicamente as fotos (originais + variantes otimizadas) com custo previsível, boa latência no Brasil, e integração viável com `next/image`. Tráfego de imagem é o principal driver de custo variável em um site de portfólio fotográfico.

## Decision Drivers
- Egress (bandwidth) previsível/zero — imagens geram tráfego significativo.
- Free tier viável.
- Integração com `next/image` (loader customizado ou oficial).
- Portabilidade (evitar lock-in forte).

## Opções consideradas
Ver comparativo completo em `docs/architecture/storage-comparison.md`.
- **Cloudflare R2**
- UploadThing
- Cloudinary

## Decisão
Adotar **Cloudflare R2** (S3-compatible) para armazenamento de binários, com pipeline de otimização própria via `sharp` executada no Server Action de upload, e `next/image` configurado com loader customizado apontando para o domínio público do bucket.

## Consequências
- Positivo: zero egress fee elimina o maior risco de custo variável imprevisível.
- Positivo: API S3-compatible mantém portabilidade (pode migrar para outro provedor S3 com baixo atrito).
- Negativo: sem transforms on-the-fly nativos — exige manter pipeline `sharp` próprio (resize, WebP/AVIF, LQIP) em vez de delegar a transformação à URL, mais código para manter, porém sob nosso controle total.
