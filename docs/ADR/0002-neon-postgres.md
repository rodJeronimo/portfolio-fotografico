# ADR-0002: Banco de dados — Neon (Postgres serverless)

## Status
Aceito

## Contexto
Precisamos persistir metadados relacionais (projetos, fotos, associação N:N, configurações do site) com integridade forte, suporte a `drizzle-kit` para migrations, e baixo custo/complexidade operacional (serverless, tier gratuito).

## Decision Drivers
- Modelo relacional com N:N (`Project` ↔ `Photo`) e FKs.
- Integração nativa com Vercel e Drizzle ORM.
- Free tier viável para um portfólio pessoal.
- Simplicidade operacional (sem gerenciar servidor de banco).

## Opções consideradas
Ver comparativo completo em `docs/architecture/db-comparison.md`.
- **Neon (Postgres serverless)**
- Turso (SQLite/libSQL serverless)

## Decisão
Adotar **Neon** como banco de dados de metadados, via `drizzle-orm/neon-http`.

## Consequências
- Positivo: integridade relacional forte para o CRUD do admin, integração nativa com Vercel (env vars automáticas), branching de DB alinhável a ambientes de preview no futuro.
- Positivo: tooling Postgres maduro (drizzle-kit, psql) para migrations e depuração.
- Negativo: cold start em autosuspend (~500ms-1s) — aceitável dado o padrão de uso (ISR cacheado no público, uso esporádico no admin).
