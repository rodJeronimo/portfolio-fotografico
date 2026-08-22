# ADR-0005: Versionamento — GitFlow clássico

## Status
Aceito

## Contexto
O projeto usa múltiplos subagentes especializados (arquiteto, frontend, backend, devops, qa, reviewer, ux-designer) trabalhando de forma coordenada, com necessidade de gates de qualidade claros (CI verde, review, testes) antes de release. Requisito explícito do usuário: GitFlow clássico, não trunk-based.

## Decision Drivers
- Separação clara entre trabalho em andamento (`develop`) e produção (`main`).
- Suporte nativo a hotfixes sem interromper o fluxo de features em andamento.
- Compatibilidade com pipeline de CI/CD com gates por tipo de branch (preview em `develop`, produção em `main`).

## Opções consideradas
- **GitFlow clássico**: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
- Trunk-based development: descartado — requisito explícito do usuário, e o volume de contribuição (single/poucos operadores) não exige a velocidade de integração contínua que trunk-based otimiza.

## Decisão
Adotar **GitFlow clássico**:
- `main` e `develop` são branches long-lived.
- `feature/*` parte de `develop` e volta para `develop` via PR (exige CI verde).
- `release/*` parte de `develop`, mergeia em `main` (exige PR + 1 review + CI verde) e de volta em `develop`.
- `hotfix/*` parte de `main`, mergeia em `main` e `develop`.
- Nunca push direto em `main`.

## Consequências
- Positivo: gates de qualidade claros mapeáveis 1:1 para os workflows de CI/CD (`preview.yml` em PRs para `develop`, `e2e.yml`/`release.yml` em PRs/push para `main`).
- Positivo: hotfixes isolados não bloqueiam features em desenvolvimento.
- Negativo: mais overhead de processo que trunk-based para um time pequeno — aceito conscientemente por ser requisito explícito do usuário.
