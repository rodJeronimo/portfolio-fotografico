# Memória — Negócio

Portfólio fotográfico pessoal (fotografia de natureza), site de **exposição** — sem e-commerce, carrinho ou checkout. Público: visitantes avaliando o trabalho do fotógrafo; único operador do admin é o próprio dono (`rodrigo.jeronimo@msn.com`, GitHub `rodJeronimo`).

## Páginas
Home/Galeria, Sobre Mim, Contato, páginas de Categoria/Projeto (Paisagens, Macro, Vida Selvagem, Long Exposure).

## Diferencial operacional
Módulo admin autenticado permite upload de fotos + edição de metadados **sem novo deploy** (ISR/`revalidatePath`, latência aceitável < 60s).

## Stack fixa (não é negociável sem novo ADR)
Next.js 15 (App Router) · TypeScript strict · Drizzle ORM + Neon (Postgres) · Cloudflare R2 · Auth.js v5 (GitHub OAuth) · Tailwind v4 · Vercel · Vitest + Playwright.

## Agentes do projeto (`.claude/agents/`)
`@pm` (backlog/board) → `@arquiteto` (ADR/estrutura, valida toda feature nova) → `@ux-designer` (guidelines, não edita código de produção) → `@frontend`/`@backend` (implementação) → `@qa` (testes, gate de merge) → `@reviewer` (aprova PR) → `@devops` (único a tocar CI/CD, Vercel, branch protection) → `@memory-keeper` (este resumo).

Ver `.claude/CLAUDE.md` para a tabela completa de orquestração.
