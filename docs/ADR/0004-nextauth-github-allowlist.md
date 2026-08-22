# ADR-0004: Autenticação admin — Auth.js v5 + GitHub OAuth + allowlist

## Status
Aceito

## Contexto
O painel administrativo precisa de autenticação protegendo `/admin/*`, sem que o dono do site precise gerenciar senhas. Há um único operador (o fotógrafo), possivelmente com um segundo colaborador futuro.

## Decision Drivers
- Sem gestão de senhas (evitar hashing, reset flow, etc. — complexidade desnecessária para 1-2 usuários).
- Simplicidade operacional: sem tabela de usuários/roles no DB.
- Já usamos GitHub para o repositório — OAuth GitHub é natural.

## Opções consideradas
- **Auth.js v5, provider GitHub, sessão JWT, allowlist via env var `ADMIN_EMAILS`**
- Auth.js com provider Google — alternativa equivalente, GitHub preferido por já ser a plataforma do repositório.
- Credenciais (email/senha) — descartado: exige gestão de senha, reset flow, maior superfície de ataque.
- Tabela de usuários/roles no DB — descartado por complexidade desnecessária para 1-2 operadores fixos.

## Decisão
Adotar **Auth.js v5 (NextAuth)** com provider **GitHub OAuth**, sessão **JWT** (sem tabela de sessão no DB), e autorização via **allowlist de e-mails na variável de ambiente `ADMIN_EMAILS`**, validada no callback `signIn`. `middleware.ts` protege todas as rotas `/admin/*`.

## Consequências
- Positivo: zero gestão de senha, superfície de ataque reduzida, setup simples via env var.
- Positivo: adicionar/remover operadores é uma mudança de variável de ambiente, sem deploy de código nem migration de DB.
- Negativo: allowlist via env var exige redeploy (ou reconfiguração de env na Vercel) para alterar operadores — aceitável dado o baixo número de mudanças esperadas.
