# Estado atual

## Entregue (versão de teste local)
- Catálogo (6 produtos fictícios, 3 SVGs cada, 2–3 variantes), página de produto, carrinho em localStorage com cotação no servidor.
- Checkout com zod → pedido `pendente` (#1001…); pagamento simulado Pix/Cartão (aprovar/recusar) via `FakeProvider`; aprovação idempotente grava Notification e loga no terminal.
- Pedido personalizado com 1–4 imagens (validação por bytes, ≤5 MB, honeypot) → status `nova`.
- Admin com senha + cookie assinado: pedidos (filtro/status), sob medida (imagens, orçamento, status), avisos.
- Testes vitest de frete/total e transições de status. Visual "A Galeria" (preto e branco) aplicado em loja e admin; DESIGN.md reescrito.
- Banco migrado de SQLite local para Postgres hospedado (Neon); mesmo banco em dev local e no deploy da Vercel (`vercel.com/mihara1/yumi-mix`).

## Pendências (prioridade)
1. Integrar provedor real (Mercado Pago, Pix/cartão) implementando `PaymentProvider` + rota de webhook — planejado, não iniciado.
2. Avisos por email/Telegram ao gravar Notification — planejado, não iniciado.
3. Definir dados reais da loja (texto/endereço de retirada, valores de frete) em `src/config.ts`.

## Limitações conhecidas
- Imagens dos produtos são ilustrações SVG geradas pelo seed (sem fotos reais).
- Sem controle de estoque; numeração de pedido calculada por `max+1` em transação (ok para uso local).
- Login do admin sem limite de tentativas além de um atraso de 500 ms.
- No Windows, o `npm run dev` às vezes serve CSS antigo após editar `globals.css`: reiniciar o servidor resolve.
- No visual "A Galeria", a tela de pagamento pendente e as páginas internas do admin (detalhe do pedido, sob medida, avisos) só herdaram os tokens: falta revisão visual dedicada.
