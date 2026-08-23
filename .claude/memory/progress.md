# Memória — Progresso (snapshot)

Fonte completa e sempre atual: `docs/tasks/BOARD.md`. Este arquivo é um snapshot rápido.

## Concluído
Fase 0–2 (setup, CI/CD, Vercel deploy) · **M0** (design tokens) · **M1** (DB+Auth, login GitHub real validado em produção) · **M2+M3** (admin upload + pipeline de imagens + reordenação DnD) · **M4** (galeria pública + lightbox acessível) · **M5** (Sobre/Contato) · **M6** (SEO completo).

Todas as milestones acima foram **validadas com dados reais** (não só testes unitários/mocks) — criação de projeto/foto reais no Neon+R2 via script `tsx`, verificação via `curl`/`npm run dev`, e limpeza depois. Ver `docs/tasks/done/` para o detalhamento de cada uma.

## Contas externas provisionadas
Neon ✅ · GitHub OAuth App ✅ · Cloudflare R2 ✅ (bucket `portfolio-fotografico`). Pendentes (com mock funcional no lugar, não bloqueiam): **Upstash Redis** (rate limiting — hoje mock em memória) e **Resend** (envio de e-mail de contato — hoje mock com `console.log`). Trocas são isoladas quando as contas existirem.

## Padrões que se repetiram — úteis saber de antemão
1. Nova env var real: (a) `.env.local`, (b) `PATCH /v9/projects/{id}/env/{envId}?teamId=...` na Vercel (token Team não funciona com `vercel env add`/`pull`/`build --prebuilt`/`whoami` — usar sempre `vercel deploy` puro), (c) **redeploy manual** (`vercel deploy --prod`).
2. Toda página que lê DB sem `searchParams` precisa de `export const dynamic = "force-dynamic"` (admin) ou aceitar ISR com `revalidate` + `revalidatePath` conectado nas Server Actions (público) — Next 15 pré-renderiza estático por padrão.
3. CI (`ci.yml`/`hotfix.yml`) precisa de `DATABASE_URL` **real** (`secrets.CI_DATABASE_URL`) no job de build — páginas públicas estáticas executam queries reais durante `next build`.
4. Testar lógica que depende de serviços reais (R2, Neon) via script `tsx` standalone quando não há como simular a UI (OAuth, drag-and-drop) — mais confiável que só unit tests com mocks.
5. `alt` de imagem nunca pode depender só de campo opcional do usuário — sempre ter um fallback textual gerado (ex.: `"Foto de {projeto}"`).

## Concluído (cont.)
- **M7 (observabilidade/polish)**: Vercel Analytics+Speed Insights, error/not-found/loading em todas as rotas públicas, skeletons (`GridSkeleton`). **Bug real do Next 15.5.23 encontrado e documentado** (não corrigido): `notFound()` em rota dinâmica dentro de route group retorna HTTP 200 em vez de 404 — isolado com 8 repros mínimas, ver `docs/architecture/known-issues.md`. Impacto SEO-only, não funcional.

## Próximo
- **Revisão heurística de `@ux-designer`** pendente para M4 e M7 (não feita — sessão solo).
- **TASK-0012 (M8 — e2e/hardening)**: Playwright real, revisão OWASP, trocar mocks por Upstash/Resend se as contas existirem até lá.
- Validação externa (Google Rich Results Test) do JSON-LD fica para quando o site estiver publicamente acessível.
- **Considerar**: mitigação do bug de `known-issues.md` (checagem de slug no middleware) se SEO virar prioridade antes de um fix upstream do Next.

## Backlog (ordem prevista)
TASK-0012 (M8) — última milestone do roadmap original.
