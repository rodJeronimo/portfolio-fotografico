import { env } from "@/lib/env";

/**
 * Isolado deliberadamente de src/lib/storage/r2.ts: aquele módulo instancia
 * o S3Client com credenciais de servidor no escopo do módulo (top-level),
 * então qualquer import dele — mesmo de um único export inofensivo — puxa
 * esse código para o bundle inteiro. Componentes client (galeria pública)
 * SÓ podem importar getPublicUrl daqui, nunca de "@/lib/storage/r2".
 * Bug real encontrado na TASK-0012 — ver docs/architecture/known-issues.md.
 */
export function getPublicUrl(key: string): string {
  return `${env.NEXT_PUBLIC_STORAGE_R2_PUBLIC_URL}/${key}`;
}
