# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Definido no briefing: Next.js (App Router) + TypeScript + Tailwind, SQLite via Prisma, uploads em disco local (`./uploads`). Dependências limitadas a next, react, typescript, tailwindcss, eslint, prisma/@prisma/client, zod, vitest.

## Users

- **Cliente final** (Brasil, quase sempre no celular): compra peças de decoração e casa impressas em 3D para si ou para presentear; também pede peças sob medida mandando foto e descrição.
- **Dona/dono da loja** (admin): acompanha pedidos pagos, move o status da produção, orça pedidos personalizados.

## Product Purpose

Yumi Mix é uma loja online autoral de impressão 3D. Esta etapa é uma versão de TESTE 100% local que valida o fluxo completo — catálogo → carrinho → checkout → pagamento simulado → admin — e o fluxo de pedido personalizado, sem nenhuma conta ou serviço externo. Sucesso = o fluxo inteiro roda localmente sem editar código.

## Positioning

Ateliê pequeno de impressão 3D: peças de decoração produzidas sob encomenda (com prazo de produção explícito) ou à pronta entrega, além de pedidos sob medida a partir de foto + texto.

## Operating Context

- Compra pelo celular, pagamento futuro via Pix/cartão (Mercado Pago) — hoje simulado.
- Entrega: "Retirada local" (grátis) ou "Entrega" com valor fixo (R$ 20,00; grátis a partir de R$ 200,00).
- Endereço é sempre obrigatório no checkout, mesmo na retirada.
- Pedido tem número curto visível (#1001…) e ID imprevisível na URL.
- Carrinho misto (pronta entrega + encomenda) mostra o maior prazo do carrinho.

## Capabilities and Constraints

- Produtos mostrados só com fotos (sem visualizador 3D). Imagens do seed são SVGs placeholder.
- Sem login de cliente, cupons, avaliações, dark mode, i18n.
- Sem rede externa, SDK de pagamento, email ou mensageria nesta etapa.
- Admin protegido por senha única (`ADMIN_PASSWORD`).

## Brand Commitments

- Nome: **Yumi Mix**.
- Voz: próxima e caprichosa — ateliê pequeno, feito por gente; trata por "você", mostra o processo. Português do Brasil, valores em BRL.

## Evidence on Hand

Nenhuma foto real, depoimento ou cliente. Não inventar depoimentos, números de vendas ou selos.

## Product Principles

1. Prazo honesto: sempre mostrar prazo de produção e o que é pronta entrega.
2. O servidor é a fonte da verdade para preços e status.
3. Pedir só o necessário; formulários curtos e claros no celular.
4. O admin é ferramenta de trabalho: rápido de ler, rápido de agir.
