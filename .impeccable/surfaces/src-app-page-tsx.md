---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Vitrine Yumi Mix (home, categoria, produto, carrinho, checkout, pagamento, sob medida)

Escopo: loja pública, mobile-first. Persuade na home; Operate em carrinho/checkout/pagamento (mesmo mundo, com contenção). Admin herda os tokens sem redesenho.
Público: quem compra organização e decoração para casa pelo celular. Ação: peça → variante → carrinho → pagar (simulado); sob medida por foto.
Restrições: fotos reais de fornecedor, sem login, sem dark mode, pt-BR, BRL; não mencionar impressão 3D.

## Direction contract

THESIS: Loja de casa clara e confiável no nível de capricho de Apple Store e Allbirds: fotos grandes em cartões bem arredondados que flutuam sobre um chão neutro, muito respiro, sombra macia em vez de linhas. Recusa a galeria P&B de células retas e linhas de 1px.

OWN-WORLD: Chão névoa clara (#f5f5f3), superfícies brancas, grafite (#17181c) para texto e ação principal, cinza-grafite (#5c606a) secundário, dourado da marca (#b8955a) só no logo e em detalhes. Raio 28px em cartões e fotos, 14px em campos, pílula em botões e chips. Sombra em duas camadas; nada de bordas divisórias. Tipo: Figtree, títulos 750 com tracking fechado e segunda linha em tom suave.

STORY: Em segundos a visitante entende "organização e decoração pra casa, pronta entrega", confia (garantias de prazo e frete visíveis), toca numa peça e compra; quem quer algo único acha "Sob medida".

FIRST VIEWPORT: Faixa de garantias fina; cabeçalho branco translúcido com logo dourado, links em pílula e sacola pílula com contador; chips de categoria. Hero: cartão arredondado grande com foto de ambiente, título branco "Peças para a sua casa", botão pílula branco "Ver as peças" + "Sob medida"; no desktop, ao lado, painel branco "Destaques" com trilho de cartões e setas redondas.

FORM: padrão da categoria (saída padrão), escolhido pela usuária na 2ª rodada; régua de capricho Apple Store / Allbirds. seed:675dd4ced6f21580

SIGNATURE: cartões de peça sobem 4px e a sombra se abre sob o cursor enquanto as fotos passam por dissolve; ao adicionar à sacola, confirmação com check que se desenha e contador da sacola que pulsa uma vez.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
