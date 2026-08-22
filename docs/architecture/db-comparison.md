# Comparativo — Neon vs Turso

**Decisão final: Neon (Postgres serverless).** Ver `docs/ADR/0002-neon-postgres.md`.

## Critérios avaliados

| Critério | Neon (Postgres) | Turso (SQLite/libSQL) |
|---|---|---|
| Modelo relacional | Postgres completo: FKs, constraints, tipos ricos (JSONB para EXIF), transações ACID robustas | SQLite: tipagem fraca (dynamic typing), FKs opcionais, sem JSONB nativo |
| Modelagem N:N (Project↔Photo) | Natural via tabela de junção + FKs fortes | Suportável, mas com menos garantias de integridade em concorrência |
| Escrita concorrente (admin) | Boa — Postgres lida bem com writes concorrentes do painel admin | SQLite é single-writer por natureza; Turso mitiga com replicação mas o nó primário ainda serializa escritas |
| Leitura distribuída/edge | Sem edge replicas nativas (mas Neon Pooler + Vercel Edge Config cobre o essencial para um site de baixo/médio tráfego) | Edge replicas globais — leitura muito rápida perto do usuário |
| Free tier | 0.5GB storage, autosuspend (cold start ~500ms-1s), branching de DB | 500 DBs, 9GB total, generoso |
| Integração Vercel | Integração nativa (Neon Vercel Integration), env vars auto-configuradas | Sem integração nativa equivalente |
| Integração Drizzle | Suporte de primeira classe (`drizzle-orm/neon-http`, `neon-serverless`) | Suporte via `drizzle-orm/libsql`, também maduro, mas ecossistema menor |
| Branching por ambiente | DB branching nativo — pode gerar branch de DB por PR/preview, alinhado ao GitFlow | Não possui branching de dados equivalente |
| Migrations | `drizzle-kit` padrão contra Postgres, ferramentas maduras (psql, pgAdmin) | `drizzle-kit` funciona, mas tooling de introspecção SQLite é mais limitado |

## Por que não Turso

Turso venceria em cenários de leitura pesada e distribuída (ex.: app global de alto tráfego lendo o mesmo dado em múltiplas regiões). Para este projeto — um portfólio com poucos escritores (1 admin), modelo relacional com N:N e necessidade de integridade forte no CRUD do painel admin — os benefícios de edge-read do Turso não compensam a perda de expressividade relacional e de integração nativa com Vercel/Drizzle que o Neon oferece. O cold start do Neon em autosuspend (~500ms-1s) é aceitável tanto para ISR (cacheado) quanto para o admin (uso esporádico).

## Decisão

**Neon**, com pooler (`neon-http` driver) para Server Actions/Route Handlers serverless.
