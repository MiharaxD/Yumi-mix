# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Definido no briefing: Next.js (App Router) + TypeScript + Tailwind, Postgres hospedado (Neon) via Prisma, uploads em disco local (`./uploads`), deploy de teste na Vercel. Dependências limitadas a next, react, typescript, tailwindcss, eslint, prisma/@prisma/client, zod, vitest.

## Users

- **Cliente final** (Brasil, quase sempre no celular): compra peças de decoração e organização para a casa, todas em pronta entrega; também pede peças sob medida mandando foto e descrição.
- **Dona/dono da loja** (admin): acompanha pedidos pagos, move o status do envio, orça pedidos personalizados.

## Product Purpose

Yumi Mix é uma loja online de decoração e organização para casa (catálogo de revenda, não mais peças autorais impressas em 3D). Esta etapa é uma versão de TESTE que valida o fluxo completo — catálogo → carrinho → checkout → pagamento simulado → admin — e o fluxo de pedido personalizado. O único serviço externo é o banco Postgres (Neon), compartilhado entre dev e produção; pagamento continua simulado. Sucesso = o fluxo inteiro roda sem editar código.

## Positioning

Loja pequena de decoração e organização: peças em pronta entrega, organizadas por categoria (Organização, Decoração sazonal), além de pedidos sob medida a partir de foto + texto. Catálogo comprado de fornecedor — o site não menciona impressão 3D, "feito à mão" ou produção própria em nenhum lugar, nem no pedido personalizado.

## Operating Context

- Compra pelo celular, pagamento futuro via Pix/cartão (Mercado Pago) — hoje simulado.
- Entrega: "Retirada local" (grátis) ou "Entrega" com valor fixo (R$ 20,00; grátis a partir de R$ 200,00).
- Endereço é sempre obrigatório no checkout, mesmo na retirada.
- Pedido tem número curto visível (#1001…) e ID imprevisível na URL.
- Carrinho misto (pronta entrega + encomenda) mostra o maior prazo do carrinho.

## Capabilities and Constraints

- Produtos mostrados só com fotos. Imagens do seed vêm de `public/produtos/` (material de fornecedor), filtradas para excluir banners com texto de marketing.
- O site não menciona "impressão 3D", "feito à mão" ou processo de produção — nem no pedido personalizado.
- Sem login de cliente, cupons, avaliações, dark mode, i18n.
- Sem rede externa, SDK de pagamento, email ou mensageria nesta etapa.
- Admin protegido por senha única (`ADMIN_PASSWORD`).

## Brand Commitments

- Nome: **Yumi Mix**.
- Visual: loja moderna clara e acolhedora, no padrão das boas lojas de produto (régua de capricho: Apple Store, Allbirds); cantos arredondados, nada de grade de linhas.
- Voz: próxima e caprichosa — ateliê pequeno, feito por gente; trata por "você", mostra o processo. Português do Brasil, valores em BRL.

## Evidence on Hand

Nenhuma foto real, depoimento ou cliente. Não inventar depoimentos, números de vendas ou selos.

## Product Principles

1. Prazo honesto: sempre mostrar prazo de produção e o que é pronta entrega.
2. O servidor é a fonte da verdade para preços e status.
3. Pedir só o necessário; formulários curtos e claros no celular.
4. O admin é ferramenta de trabalho: rápido de ler, rápido de agir.
