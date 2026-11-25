# Estado atual

## Entregue (versão de teste local)
- Loja só vitrine: catálogo real (7 produtos, 2 categorias: Organização e Decoração sazonal), com trilho de categorias, seções por categoria e banda de coleções na home; página de produto com preço, variações e botões para o anúncio na Shopee/Mercado Livre (links por produto no admin, "Em breve" sem link). Carrinho, checkout, frete do cliente e Mercado Pago removidos da loja. Nos cards de peça, passar o mouse passa as fotos por dissolve; na página de produto, galeria com dissolve, swipe no celular e miniaturas em coluna no desktop. Página 404 própria.
- Logo nova (`LogoYumiMix`) no cabeçalho/rodapé/admin; favicon (`src/app/icon.svg`); preview de link (Open Graph) gerado para o site e para cada peça.
- Pedido personalizado com 1–4 imagens (validação por bytes, ≤5 MB, honeypot) → status `nova`.
- Admin com senha + cookie assinado: pedidos (filtro/status, rastreio, botão "Abrir no Bambu Studio"/baixar .3mf por item), produtos (criar/editar/arquivar/excluir, variações e preço, fotos e vídeo com ordem e capa, .3mf interno, frete embutido, peso e caixa), frete (CEP de origem, frete grátis acima de, frete fixo de reserva), sob medida, avisos.
- Testes vitest de frete, Melhor Envio, link do .3mf, rastreio, formulário de produto (incluindo links das lojas), checkout e status. Visual claro e arredondado (cartões com sombra, pílulas, Figtree) aplicado na loja; admin herda os tokens.
- Banco em Postgres hospedado (Neon), o mesmo em dev local e no deploy.
- Deploy no Railway (projeto `yumi-mix`, serviço `loja`, https://yumimix.com.br e https://yumimix.up.railway.app): builda a `main` do GitHub (`MiharaxD/Yumi-mix`), mas o push nem sempre dispara o deploy sozinho — se não aparecer deploy novo, reconectar a fonte do serviço (`connect-service-source`) dispara o build; volume `uploads` montado em `/app/uploads`. O deploy antigo da Vercel (`vercel.com/mihara1/yumi-mix`) pode ser desligado.

## Pendências (prioridade)
0. Vitrine no ar: falta cadastrar os links Shopee/ML de cada peça em `/admin/produtos` (o formulário do admin só foi coberto por teste, não testado no navegador).
1. Limpeza do que sobrou da venda direta (decidir com a usuária): aba Pedidos/Frete/rastreio do admin, campos de frete embutido/peso/caixa do produto, `src/lib/{orders,cart-server,pricing,melhor-envio,schemas,settings}.ts`, dependência `mercadopago`, variáveis `MP_*`/`MELHOR_ENVIO_*`/`RESEND_*`.
2. Preços e dimensões dos 7 produtos são valores de teste — ajustar no admin (devem bater com os anúncios).
3. Links de redes sociais no rodapé (`SOCIAL_LINKS` em `src/config.ts`) são placeholder; definir os reais.
4. As fotos do Kit 3 Ganchos têm etiqueta do fornecedor embutida.
5. Subir os .3mf de cada produto e testar "Abrir no Bambu Studio".

## Limitações conhecidas
- Sem controle de estoque; numeração de pedido calculada por `max+1` em transação (ok para uso local).
- Railway está no trial; para manter no ar, assinar o Hobby (US$ 5). Uploads dependem do volume (um único serviço/região).
- Login do admin sem limite de tentativas além de um atraso de 500 ms.
- No Windows, o `npm run dev` às vezes serve CSS antigo após editar `globals.css`: reiniciar o servidor resolve.
- As páginas internas do admin (detalhe do pedido, sob medida, avisos) foram só arredondadas, sem revisão visual dedicada no navegador.
