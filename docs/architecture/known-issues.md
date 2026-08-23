# Known Issues

## `notFound()` retorna HTTP 200 em rotas dinâmicas dentro de route groups (Next 15.5.23)

**Status**: aberto, sem fix aplicado — impacto limitado a SEO (soft 404), não a funcionalidade.

**Sintoma**: `src/app/(public)/projetos/[slug]/page.tsx` chama `notFound()` quando o slug não existe. O conteúdo renderizado está correto (`not-found.tsx` da rota/segmento aparece normalmente), mas o **status HTTP da resposta é 200**, não 404.

**Isolado via repro mínimo** (TASK-0011): criadas rotas de teste descartáveis para eliminar hipóteses uma a uma —

| Cenário testado | Resultado |
|---|---|
| `notFound()` em rota estática simples (`/teste-404`), fora de qualquer route group | 404 ✅ |
| `notFound()` em rota dinâmica `[slug]` simples, fora de route group | 404 ✅ |
| Idem + `generateMetadata` assíncrono + múltiplos `await` antes do `notFound()` | 404 ✅ |
| Idem + query real no Drizzle/Neon antes do `notFound()` | 404 ✅ |
| Mesma rota dinâmica minimalista, mas **dentro** de `app/(public)/...` | **200 ❌** |
| Idem, removendo `not-found.tsx` do grupo | **200 ❌** |
| Idem, removendo também `error.tsx` do grupo | **200 ❌** |
| Idem, removendo também `layout.tsx` do grupo (grupo vazio, só a pasta) | **200 ❌** |

**Conclusão**: o bug não está relacionado a `not-found.tsx`, `error.tsx`, `layout.tsx`, `generateMetadata`, `revalidate`, nem a queries assíncronas — é acionado **apenas** por a rota dinâmica estar aninhada dentro de um *route group* (`(nome)`), independentemente do conteúdo desse grupo. Parece um bug genuíno do App Router nesta versão do Next (15.5.23).

**Por que não foi corrigido agora**:
- Reestruturar para remover o route group `(public)` contradiria a arquitetura documentada (`docs/architecture/folder-structure.md`) e exigiria mover todas as rotas públicas, sem garantia de que o bug não reapareça de outra forma.
- Impacto é puramente de SEO (crawlers podem tratar a URL como "soft 404" em vez de 404 real) — não afeta usuários reais (veem a mensagem correta) nem funcionalidade.
- `sitemap.xml` nunca lista slugs inexistentes, então o caminho normal de descoberta pelo Google não é afetado — só URLs órfãs/digitadas errado acessadas diretamente.

**Mitigação recomendada quando houver tempo**:
1. Testar se um upgrade/downgrade de versão do Next 15.x resolve (checar changelog/issues do repositório `vercel/next.js` por "route group notFound status").
2. Alternativa: mover a validação de existência do projeto para o `middleware.ts` (que já roda antes do render), retornando uma `NextResponse` com status 404 explícito antes mesmo de chegar à página — contorna o bug por completo, mas exigiria uma query ao DB no middleware (edge runtime, latência extra) ou uma lista cacheada de slugs válidos.

**Nota (TASK-0012)**: não bloqueou a suite e2e — os testes de galeria (`tests/e2e/gallery.spec.ts`) sempre navegam para slugs existentes (seedados antes de cada teste), nunca exercitando o caminho de 404. O bug permanece real e documentado, só não tem cobertura de teste automatizado (adicionar um teste específico de "slug inexistente retorna 404" ficaria vermelho até o bug ser corrigido — decisão consciente de não adicionar um teste sabidamente falho).
