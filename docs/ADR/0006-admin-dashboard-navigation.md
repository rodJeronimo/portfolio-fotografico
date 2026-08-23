# ADR-0006: Dashboard admin — layout compartilhado e rota de fotos aninhada em projeto

## Status
Aceito

## Contexto
`/admin` hoje é um placeholder sem links ("Autenticado com sucesso."). Não existe layout/nav compartilhado entre as rotas administrativas (`/admin/projects`, `/admin/fotos`, `/admin/settings`), então cada página é uma ilha — o operador (dono/único admin) precisa conhecer as URLs de cor.

Adicionalmente, `/admin/fotos` usa `?projectId=` (query param) em vez de rota dinâmica. Isso agrava o problema de navegabilidade: a rota não é linkável de forma autodescritiva, não aparece em nenhuma listagem/menu, e só funciona se o operador já tiver o `projectId` em mãos (hoje só acessível clicando em "Gerenciar fotos" a partir de `/admin/projects`, nunca digitando a URL diretamente).

O `docs/architecture/folder-structure.md` já previa `app/(admin)/admin/layout.tsx` e `projetos/[id]/page.tsx` (rota dinâmica), mas a implementação real divergiu: sem route group `(admin)`, sem `layout.tsx`, e `fotos` como rota irmã de `projects` usando query param em vez de aninhamento. Este ADR corrige a rota de fotos e formaliza o layout compartilhado, ambos disparados pelo mesmo pedido do usuário (dashboard de navegação pós-login).

## Decision Drivers
- Eliminar a necessidade de "descobrir" URLs — toda rota administrativa deve ser alcançável por link a partir do dashboard.
- Uma feature de fotos sem projeto não faz sentido no domínio (toda foto pertence a um projeto via `projectPhoto`) — a URL deveria refletir essa hierarquia.
- Consistência com o padrão já usado nas rotas públicas (`/projetos/[slug]`) e com o que `docs/architecture/folder-structure.md` já documentava.
- Minimizar retrabalho: mudança deve ser localizada (rotas admin), sem tocar em modelo de dados ou nas rotas públicas.
- Layout compartilhado não deve introduzir estado novo (sem tabela de "menu" no DB) — é puramente estrutura de arquivos/composição de UI.

## Opções consideradas

**Rota de fotos:**
| Opção | Prós | Contras |
|---|---|---|
| Manter `/admin/fotos?projectId=` | Zero mudança de código | Não resolve a reclamação do usuário; URL não autodescritiva; diverge do padrão já documentado |
| `/admin/fotos/[projectId]` | Rota dinâmica, linkável | Fotos ainda "soltas", fora da hierarquia de projeto |
| `/admin/projects/[projectId]/fotos` (escolhida) | Reflete hierarquia real do domínio (projeto → fotos); permite breadcrumb natural; alinhado ao padrão público `/projetos/[slug]`; abre caminho para futura página de edição em `/admin/projects/[projectId]` | Exige mover `actions.ts`/componentes de `admin/fotos/` para dentro de `admin/projects/[projectId]/fotos/`; ajustar `revalidatePath` |

**Layout/navegação:**
| Opção | Prós | Contras |
|---|---|---|
| Sem layout — cada página cuidando do próprio nav | Zero código novo | Duplicação de nav em cada página; inconsistente |
| `src/app/admin/layout.tsx` com nav compartilhado (escolhida) | Um único ponto de nav/chrome; `/admin` (page.tsx) vira o hub/dashboard em si; consistente com o app router | Nenhum relevante — é o padrão idiomático do App Router |

## Decisão
1. **Migrar `/admin/fotos?projectId=...` para rota dinâmica aninhada `/admin/projects/[projectId]/fotos`.** A pasta `src/app/admin/fotos/` é removida; seu conteúdo (`page.tsx`, `actions.ts`, `upload-form.tsx`, `photo-reorder-list.tsx`) move para `src/app/admin/projects/[projectId]/fotos/`. Todo `revalidatePath("/admin/fotos")` nas Server Actions passa a usar `revalidatePath(\`/admin/projects/${projectId}/fotos\`)`. Links em `/admin/projects` (`admin/projects/page.tsx`) passam a apontar para `/admin/projects/${p.id}/fotos`.
2. **Criar `src/app/admin/layout.tsx`** como Server Component que envolve todas as rotas `/admin/*` (exceto `login`, que já é público antes da sessão existir) com uma nav persistente (header ou sidebar) listando: Dashboard (`/admin`), Projetos (`/admin/projects`), Configurações (`/admin/settings`), e ação de logout. O componente de nav em si vive em `src/components/admin/admin-nav.tsx` (Client Component, para estado de item ativo/menu mobile), consumido pelo layout.
3. **`src/app/admin/page.tsx` vira o dashboard/hub**: Server Component que lista as áreas de gestão como cards/links descritivos (ex.: "Projetos — criar e organizar projetos", "Configurações do site"). Não requer nova query de agregação obrigatória nesta etapa — pode opcionalmente mostrar contagem de projetos/fotos como enhancement, decisão de composição de `@frontend`/`@ux-designer`, não estrutural.
4. Nenhuma mudança de schema de dados é necessária — `project.id` já é a chave usada.

## Estrutura de pastas resultante (referência para `@frontend`)
```
src/app/admin/
├── layout.tsx                        # nav compartilhada (server) + AdminNav (client)
├── page.tsx                          # dashboard/hub com links descritos
├── login/
│   └── page.tsx
├── projects/
│   ├── page.tsx                      # listagem de projetos
│   ├── actions.ts
│   ├── project-form.tsx
│   └── [projectId]/
│       └── fotos/
│           ├── page.tsx              # gestão de fotos do projeto (ex admin/fotos)
│           ├── actions.ts            # movido de admin/fotos/actions.ts; revalidatePath ajustado
│           ├── upload-form.tsx
│           └── photo-reorder-list.tsx
└── settings/
    ├── page.tsx
    ├── actions.ts
    └── settings-form.tsx

src/components/admin/
└── admin-nav.tsx                     # nav client component usado pelo layout
```

`docs/architecture/folder-structure.md` deve ser atualizado por este ADR para refletir a estrutura real (route group `(admin)` documentado nunca foi adotado na prática — implementação usa `/admin` direto, sem route group; isso é aceito retroativamente e não será revertido, dado que `middleware.ts` já protege via matcher de path, não de route group).

## Consequências
- Positivo: toda rota administrativa fica alcançável por navegação, resolvendo a reclamação do usuário.
- Positivo: URL de fotos passa a ser autodescritiva e reflete a hierarquia real do domínio (projeto → fotos), eliminando o estado "órfão" de `/admin/fotos` sem projeto.
- Positivo: layout compartilhado é o único lugar de nav — qualquer rota admin nova (futura) herda a navegação automaticamente.
- Negativo / custo único: `@backend` precisa mover `admin/fotos/*` para `admin/projects/[projectId]/fotos/*` e ajustar `revalidatePath`; `@frontend` precisa ajustar o `Link` em `admin/projects/page.tsx` (era `/admin/fotos?projectId=${p.id}`, passa a ser `/admin/projects/${p.id}/fotos`). Sem mudança de banco de dados, sem downtime além do deploy normal.
- Neutro: `docs/architecture/folder-structure.md` é atualizado para refletir a estrutura real (sem route group `(admin)`), evitando nova divergência entre documentação e implementação.
