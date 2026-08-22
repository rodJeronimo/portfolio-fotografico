# ADR-0001: Framework — Next.js 15 App Router monolítico

## Status
Aceito

## Contexto
Precisamos de um site público de exposição fotográfica com SEO forte, performance (Core Web Vitals "Good"), e um módulo administrativo autenticado para upload de fotos sem novo deploy. Restrição explícita: baixa complexidade operacional — sem Kubernetes, sem microsserviços.

## Decision Drivers
- Necessidade de Server Components para SEO/performance sem JS excessivo no client.
- Necessidade de Server Actions para o fluxo de upload/admin sem construir uma API REST separada.
- ISR nativo para publicação de novas fotos sem rebuild completo.
- Baixa complexidade operacional (um único deploy, um único runtime).

## Opções consideradas
- **Next.js 15 App Router (monolito)** — Server Components, Route Handlers, Server Actions, ISR nativo.
- Next.js Pages Router — mais maduro, mas sem Server Components/Server Actions nativos, exigiria API Routes separadas para o admin.
- Framework separado para admin (ex. SPA + API própria) — maior complexidade operacional, dois deploys, duplicação de auth.

## Decisão
Adotar **Next.js 15 com App Router**, monolito único hospedado na Vercel, com route groups `(public)` e `(admin)` para separar o site público do painel administrativo dentro da mesma aplicação.

## Consequências
- Positivo: um único deploy, ISR nativo resolve o requisito de publicação sem rebuild, Server Actions eliminam a necessidade de uma API REST dedicada para o admin.
- Positivo: Server Components reduzem JS enviado ao client, ajudando LCP/INP.
- Negativo: acoplamento entre público e admin no mesmo runtime — mitigado por route groups + middleware de auth isolando `/admin/*`.
