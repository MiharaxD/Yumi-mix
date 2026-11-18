# Estado atual

## Entregue (versão de teste local)
- Catálogo real (7 produtos de revenda, fotos de fornecedor, 2 categorias: Organização e Decoração sazonal), com trilho de categorias, seções por categoria e banda de coleções na home; página de produto; carrinho em localStorage com cotação no servidor. Nos cards de peça, passar o mouse passa as fotos por dissolve; na página de produto, galeria com dissolve, swipe no celular e miniaturas em coluna no desktop. Página 404 própria.
- Logo nova (`LogoYumiMix`) no cabeçalho/rodapé/admin; favicon (`src/app/icon.svg`).
- Checkout com zod → pedido `pendente` (#1001…); pagamento simulado Pix/Cartão (aprovar/recusar) via `FakeProvider`; aprovação idempotente grava Notification e loga no terminal.
- Pedido personalizado com 1–4 imagens (validação por bytes, ≤5 MB, honeypot) → status `nova`.
- Admin com senha + cookie assinado: pedidos (filtro/status), sob medida (imagens, orçamento, status), avisos.
- Testes vitest de frete/total e transições de status. Visual claro e arredondado (cartões com sombra, pílulas, Figtree) aplicado na loja; admin herda os tokens.
- Banco migrado de SQLite local para Postgres hospedado (Neon); mesmo banco em dev local e no deploy da Vercel (`vercel.com/mihara1/yumi-mix`).

## Pendências (prioridade)
1. Integrar provedor real (Mercado Pago, Pix/cartão) implementando `PaymentProvider` + rota de webhook — planejado, não iniciado.
2. Avisos por email/Telegram ao gravar Notification — planejado, não iniciado.
3. Preços e dimensões dos 7 produtos em `prisma/seed.mts` são valores de teste (sem dado real de venda/fornecedor) — ajustar quando tiver os números reais.
4. Links de redes sociais no rodapé (`SOCIAL_LINKS` em `src/config.ts`) são placeholder; definir dados reais da loja (endereço de retirada, valores de frete) também em `src/config.ts`.
5. Rodar `npm run db:seed` (banco compartilhado, decisão da usuária) para a capa do suporte de lavadora virar a foto de ambiente; hoje o banco ainda mostra o diagrama de medidas. As fotos do Kit 3 Ganchos têm etiqueta do fornecedor embutida (sem capa limpa disponível).

## Limitações conhecidas
- Sem controle de estoque; numeração de pedido calculada por `max+1` em transação (ok para uso local).
- Login do admin sem limite de tentativas além de um atraso de 500 ms.
- No Windows, o `npm run dev` às vezes serve CSS antigo após editar `globals.css`: reiniciar o servidor resolve.
- A tela de pagamento pendente/pago e as páginas internas do admin (detalhe do pedido, sob medida, avisos) foram só arredondadas, sem revisão visual dedicada no navegador.
