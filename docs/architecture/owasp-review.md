# Revisão OWASP Top 10 (2021) — Final (TASK-0012)

Revisão de encerramento antes de considerar o produto pronto para uso real. Sem itens críticos abertos.

| # | Categoria | Status | Mitigação implementada |
|---|---|---|---|
| A01 | Broken Access Control | ✅ | `middleware.ts` protege `/admin/*`; toda Server Action revalida sessão via `requireAdminSession()` (defesa em profundidade, não depende só do middleware); allowlist `ADMIN_EMAILS` no callback `signIn`. Validado com e2e real (`admin-protected.spec.ts`). |
| A02 | Cryptographic Failures | ✅ | Segredos nunca commitados (`.env.local` gitignored, `.env.example` só com chaves vazias); HTTPS obrigatório em produção (Vercel); `AUTH_SECRET` real gerado (`openssl rand`); presigned URLs do R2 expiram em 5min. |
| A03 | Injection | ✅ | Drizzle ORM (queries parametrizadas, sem concatenação de SQL bruto) em 100% do acesso a dados; Zod valida toda entrada de Server Action antes de tocar o banco. |
| A04 | Insecure Design | ✅ | Rate limiting no upload (mock documentado, TASK-0006/0012 — troca por Upstash é isolada); validação de MIME real via magic bytes (não confia em extensão/Content-Type do client); EXIF sanitizado com whitelist (GPS nunca lido); honeypot no formulário de contato. |
| A05 | Security Misconfiguration | ✅ (corrigido nesta task) | Headers de segurança em `vercel.json` (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`); **CORS do bucket R2 configurado** restrito a origens conhecidas (localhost dev, domínio Vercel) — **bug crítico real encontrado e corrigido nesta task**: sem isso, upload direto do navegador para o R2 era bloqueado silenciosamente, quebrando o fluxo real de upload (só pego por teste e2e real, nunca por scripts Node). `AUTH_TRUST_HOST` restrito a builds locais (Vercel real confia via proxy próprio). |
| A06 | Vulnerable/Outdated Components | ⚠️ aceito conscientemente | `npm audit` reporta vulnerabilidades em dependências transitivas/dev-only (esbuild do drizzle-kit, postcss/sharp internos ao bundle do Next) — não afetam runtime de produção; nosso `sharp` próprio está em `0.35.3` (patched). Documentado desde TASK-0001. |
| A07 | Identification and Authentication Failures | ✅ | OAuth GitHub (sem gestão de senha), sessão JWT, allowlist de e-mail. Login real validado em produção pelo usuário (TASK-0005). |
| A08 | Software and Data Integrity Failures | ✅ | CI (lint/type-check/test/build) obrigatório em todo PR; branch protection em `main`/`develop`; GitFlow com PR review. |
| A09 | Security Logging and Monitoring Failures | ⚠️ básico | Vercel Analytics + Speed Insights (TASK-0011) cobrem observabilidade de uso/performance, não eventos de segurança dedicados (ex.: tentativas de login falhas, rate limit excedido só loga no console do servidor). Aceitável para site de operador único; monitoramento de segurança dedicado (ex. Sentry, alertas) é melhoria futura, não crítico no escopo atual. |
| A10 | Server-Side Request Forgery (SSRF) | ✅ não aplicável | Aplicação não busca URLs arbitrárias fornecidas por usuário (uploads vão para chaves geradas internamente, não URLs externas controladas por input). |

## Achados críticos desta revisão

1. **CORS ausente no bucket R2** (A05) — encontrado pelo primeiro teste e2e real via navegador (`admin-upload.spec.ts`), nunca detectado por testes anteriores (scripts Node não sofrem CORS). Corrigido: usuário configurou CORS policy no painel Cloudflare restrita às origens conhecidas.
2. **Vazamento potencial de credenciais de servidor para o bundle client** (A02/A05) — `getPublicUrl()` estava no mesmo módulo que o `S3Client` (credenciais R2); qualquer Client Component que importasse a função pura arriscava puxar o módulo inteiro (incluindo a instanciação do cliente S3 com secrets) para o JS enviado ao navegador. O guard do `@t3-oss/env-nextjs` bloqueou em runtime (o que gerou o erro visível), mas o design era arriscado. Corrigido: `getPublicUrl` isolado em módulo próprio (`src/lib/storage/public-url.ts`), sem nenhuma dependência de código server-only; `STORAGE_R2_PUBLIC_URL` recategorizada corretamente como `NEXT_PUBLIC_*` (nunca foi segredo — é a URL pública das fotos).

## Conclusão

Nenhum item crítico em aberto. Os dois achados acima eram bugs reais de configuração/design, ambos corrigidos com validação real (e2e passando de ponta a ponta após as correções). Itens A06/A09 são aceitos conscientemente dado o porte do projeto (portfólio pessoal, operador único), documentados para revisão futura se o escopo crescer.
