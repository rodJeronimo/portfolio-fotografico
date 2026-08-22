# Fluxo de Upload de Foto

```mermaid
sequenceDiagram
    actor Admin
    participant AdminUI as Admin UI (Client Component)
    participant Auth as Auth.js (middleware + session)
    participant SA as Server Action (upload)
    participant R2 as Cloudflare R2
    participant Sharp as Pipeline sharp
    participant DB as Drizzle + Neon
    participant Public as Página pública (ISR)

    Admin->>AdminUI: Login via GitHub OAuth
    AdminUI->>Auth: signIn()
    Auth-->>Auth: valida email contra ADMIN_EMAILS
    Auth-->>AdminUI: sessão JWT válida

    Admin->>AdminUI: seleciona foto + preenche metadados
    AdminUI->>SA: solicita upload (nome, mimetype, tamanho)
    SA->>Auth: valida sessão + allowlist
    SA->>SA: valida MIME real (magic bytes) + tamanho
    SA->>R2: gera presigned PUT URL (expira em 5min)
    SA-->>AdminUI: retorna presigned URL

    AdminUI->>R2: PUT direto do arquivo original (client → R2)
    R2-->>AdminUI: 200 OK

    AdminUI->>SA: confirma upload concluído + metadados finais
    SA->>R2: baixa original (ou processa via stream)
    SA->>Sharp: gera variantes (thumbnail/medium AVIF+WebP) + LQIP blur
    Sharp->>R2: grava variantes otimizadas
    SA->>DB: INSERT photo (storageKey, exifJson sanitizado, blurDataUrl, width, height)
    SA->>DB: INSERT/UPDATE project_photo (associação + displayOrder)
    SA->>Public: revalidatePath('/[locale]/projetos/[slug]')
    Public-->>Admin: foto visível publicamente (< 60s)
```

## Notas

- Upload do arquivo original vai **direto do client para o R2** via presigned URL — o Server Action não faz proxy do binário, evitando limites de payload de Server Actions/Route Handlers na Vercel.
- O processamento (`sharp`) roda no Server Action após confirmação de upload, lendo o objeto original do R2 e escrevendo as variantes de volta.
- EXIF é extraído e sanitizado antes de gravar em `photo.exif_json` (ver `security.md`).
- `revalidatePath` (ou `revalidateTag` se usarmos tags por projeto) garante que a página pública do projeto reflita a nova foto em até 60s, sem novo deploy.
