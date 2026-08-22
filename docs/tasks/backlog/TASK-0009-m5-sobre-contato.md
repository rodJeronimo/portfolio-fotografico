---
id: TASK-0009
title: "M5 — Sobre Mim e Contato (conteúdo editável + formulário)"
milestone: M5
owner: "@backend"
status: Backlog
depends_on: [TASK-0006]
related_docs: [docs/architecture/data-model.md]
---

# TASK-0009 — M5: Sobre Mim e Contato

## Contexto
Páginas institucionais com conteúdo editável via admin (`site_settings`) e formulário de contato funcional.

## Escopo
CRUD de `site_settings` no admin (`@backend`), páginas públicas Sobre/Contato (`@frontend`), Server Action de envio de contato integrada a Resend ou Formspree (decisão de implementação de `@backend`, documentar escolha).

## Critérios de aceite
- [ ] Given admin edita o texto de "Sobre Mim", When salva, Then a página pública reflete a mudança após revalidação (<60s).
- [ ] Given visitante preenche o formulário de contato com dados válidos, When envia, Then recebe confirmação de sucesso e o e-mail é entregue ao fotógrafo.
- [ ] Given envio com dados inválidos, When submetido, Then validação zod bloqueia com mensagens claras.
- [ ] Formulário protegido contra spam básico (honeypot ou rate limit).

## Dependências
TASK-0006 (admin base precisa existir).

## Resultado
*(a preencher)*
