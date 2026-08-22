# Segurança

## Rate limiting de upload

- **Upstash Ratelimit** (sliding window), aplicado no Server Action de upload, chaveado pelo `userId`/email da sessão admin (não por IP, já que só há um operador autenticado).
- Limite sugerido: ex. 30 uploads / 10 minutos — suficiente para uso normal, previne abuso caso a sessão seja comprometida.
- Resposta de rate limit excedido tratada de forma explícita na UI do admin (mensagem clara, não erro genérico).

## Validação de MIME type

- Nunca confiar apenas em `Content-Type` do client ou extensão do arquivo.
- Validar **magic bytes** (assinatura binária real do arquivo) no Server Action antes de gerar a presigned URL e novamente antes de processar com `sharp`.
- Apenas JPEG, PNG, WebP, AVIF (formatos de origem aceitos para upload) — rejeitar qualquer outro tipo.
- Limite de tamanho de arquivo (ex. 25MB) validado antes da presigned URL (Content-Length pinado na assinatura).

## Sanitização de EXIF

- Extrair EXIF no processamento (`sharp`/lib dedicada) e persistir em `photo.exif_json` **apenas um subconjunto whitelisted** (câmera, lente, abertura, ISO, velocidade, data de captura).
- **GPS/geolocalização removido por padrão.** Se o fotógrafo quiser expor localização, isso é feito explicitamente via campo `photo.location` (texto livre, editado manualmente no admin), nunca extraído automaticamente do EXIF GPS.
- Tags EXIF sensíveis (serial number do dispositivo, thumbnails embutidos) sempre descartadas.

## CSRF

- Server Actions do Next.js já aplicam mitigação nativa (verificação de origem/same-origin enforcement) — não é necessário token CSRF manual.
- Route Handlers que aceitam mutação (se houver, ex. webhooks) devem validar origem/assinatura explicitamente (não se aplica ao fluxo principal, que usa Server Actions).

## Assinatura de URLs

- Presigned URLs do R2 com **expiração curta (5 minutos)**, escopo restrito a um único objeto (`storageKey` específico), método `PUT` fixado, `Content-Type` e `Content-Length` pinados na assinatura para evitar upload de payload diferente do autorizado.
- URLs de leitura pública das imagens **não são assinadas** (bucket com acesso público de leitura via domínio custom, já que o conteúdo é destinado à exposição pública).

## Outras medidas

- `ADMIN_EMAILS` e segredos nunca commitados — validados em build time via `@t3-oss/env-nextjs`.
- Cabeçalhos de segurança padrão (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`) configurados via `next.config.ts` headers ou `vercel.json` (detalhado na Fase 4).
- Dependências com `npm audit`/Dependabot habilitado no repositório (configuração em `@devops`, Fase 2/3).
