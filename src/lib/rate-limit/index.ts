/**
 * Rate limiter em memória — placeholder até a conta Upstash existir
 * (ver docs/architecture/security.md e docs/tasks/backlog/TASK-0006-m2-admin-upload-mvp.md).
 *
 * Sliding window simples por identificador (email do admin). Funciona
 * corretamente para uma unica instancia de servidor; NAO e distribuido
 * (cada instancia serverless da Vercel tem sua propria memoria) —
 * aceitavel como placeholder pois o unico operador e o proprio dono
 * do site, mas DEVE ser trocado por @upstash/ratelimit antes de expor
 * o admin a mais operadores ou escalar para multiplas instancias.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS = 30;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
}

export function checkRateLimit(identifier: string, now = Date.now()): RateLimitResult {
  const windowStart = now - WINDOW_MS;
  const timestamps = (hits.get(identifier) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(identifier, timestamps);
    return { success: false, remaining: 0, limit: MAX_REQUESTS };
  }

  timestamps.push(now);
  hits.set(identifier, timestamps);
  return { success: true, remaining: MAX_REQUESTS - timestamps.length, limit: MAX_REQUESTS };
}
