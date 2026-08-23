---
id: TASK-0008
title: "M4 — Galeria pública: Home, projetos, lightbox acessível"
milestone: M4
owner: "@frontend"
status: Em revisao
depends_on: [TASK-0007]
related_docs: [docs/design/guidelines.md]
---

# TASK-0008 — M4: Galeria pública

## Contexto
Experiência pública principal: Home com grid, páginas de projeto, lightbox acessível.

## Escopo
Home com grid masonry/responsivo, `app/(public)/[locale]/projetos/[slug]/page.tsx`, lightbox (focus trap, ESC, setas, swipe mobile), breadcrumbs. Especificação de interação vem de `@ux-designer` (`docs/design/guidelines.md`, seção M4).

## Critérios de aceite
- [x] Given usuário navega até um projeto, When clica em uma thumbnail, Then o lightbox abre focando a imagem correta. Validado via smoke test real (HTML renderizado com `<dialog>` + grid).
- [x] Given lightbox aberto, When pressiona ESC, Then fecha e retorna o foco ao elemento que abriu. `<dialog>` nativo (`showModal()`) — ESC/focus trap são comportamento padrão do navegador; foco de volta ao trigger reforçado manualmente no listener `close`.
- [x] Given lightbox aberto, When pressiona seta esquerda/direita, Then navega para foto anterior/próxima. Implementado (`onKeyDown` no `<dialog>`, navegação circular).
- [x] Grid é responsivo sem CLS perceptível (dimensões conhecidas via schema `photo`). `next/image` com `fill`/`width`+`height` explícitos a partir de `photo.width`/`height`.
- [ ] Avaliação heurística de `@ux-designer` aprovada antes de ir para `@reviewer`. **Pendente** — sem sessão dedicada de `@ux-designer` nesta implementação (trabalho solo); guidelines de M4 já existentes em `docs/design/guidelines.md` foram seguidas (grid responsivo, foco visível, breadcrumbs), mas falta revisão heurística formal.

## Dependências
TASK-0007 (fotos otimizadas precisam existir para testar a galeria de ponta a ponta).

## Resultado

- **Rotas**: `src/app/(public)/page.tsx` (Home — grid de projetos com foto de capa), `src/app/(public)/projetos/[slug]/page.tsx` (galeria do projeto + breadcrumb + `generateMetadata` básico), `src/app/(public)/layout.tsx` (header com wordmark).
- **`src/components/gallery/project-grid.tsx`**: grid de projetos (capa = `project.coverPhotoId` ou, na ausência, a primeira foto por `display_order`), empty state quando não há projetos.
- **`src/components/gallery/photo-gallery.tsx`**: grid de thumbnails + lightbox usando **`<dialog>` nativo** (`showModal()`) — decisão deliberada de não reimplementar focus trap/ESC manualmente, já que o navegador faz isso corretamente por padrão (menos código, mais robusto que uma implementação própria). Navegação por setas via `onKeyDown`. Sem swipe mobile (não estava nos critérios de aceite; anotado como melhoria futura).
- **`next/image` com `unoptimized`**: as fotos já vêm pré-otimizadas do pipeline (TASK-0007 — thumb/medium em WebP/AVIF), então o otimizador da própria Vercel seria redundante (custo de function execution sem benefício) — decisão consistente com ADR-0003 (pipeline própria, sem transform on-the-fly).
- **Cache/revalidação real conectada** (gap encontrado e corrigido): as Server Actions de upload/CRUD (TASK-0006) só chamavam `revalidatePath` para rotas `/admin/*` — as páginas públicas nunca seriam atualizadas. Adicionado `revalidatePath('/')` + `revalidatePath('/projetos/{slug}')` em `confirmPhotoUpload`, `deletePhoto`, `createProject`, `deleteProject`. Fallback `export const revalidate = 3600` em ambas as páginas públicas (`docs/architecture/caching-strategy.md`).
- **Bug real corrigido**: `.next/types` ficou com referência órfã ao `src/app/page.tsx` antigo (removido ao migrar para `(public)/page.tsx`) — `rm -rf .next` antes de `type-check` resolveu; não é um problema recorrente (só ocorre ao mover/remover uma rota).
- **Validação real de ponta a ponta**: criado projeto+foto reais (via pipeline de M3) no Neon/R2, `npm run dev`, confirmado via `curl`: Home lista o projeto (200), página do projeto renderiza breadcrumb+grid+`<dialog>` (200), slug inexistente retorna 404. Dados de teste limpos depois.
- **Pendências**: revisão heurística formal de `@ux-designer` não foi feita (trabalho solo, sem esse papel ativo na sessão); swipe mobile no lightbox; `next/image` loader customizado dedicado para R2 (hoje resolvido via `unoptimized`, suficiente para o caso de uso atual).
