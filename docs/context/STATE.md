# Estado atual

## Entregue (versão de teste local)
- Catálogo real (7 produtos de revenda, fotos de fornecedor, 2 categorias: Organização e Decoração sazonal), com trilho de categorias, seções por categoria e banda de coleções na home; página de produto; carrinho em localStorage com cotação no servidor. Nos cards de peça, passar o mouse passa as fotos por dissolve; na página de produto, galeria com dissolve, swipe no celular e miniaturas em coluna no desktop. Página 404 própria.
- Logo nova (`LogoYumiMix`) no cabeçalho/rodapé/admin; favicon (`src/app/icon.svg`); preview de link (Open Graph) gerado para o site e para cada peça.
- Checkout com zod → pedido `pendente` (#1001…) → Mercado Pago Checkout Pro (app "Yumi Mix", ID 4279781666885942, com usuários de teste automáticos) quando há `MP_ACCESS_TOKEN`; sem ele, pagamento simulado via `FakeProvider`. Aprovação (webhook ou volta do checkout) é idempotente, confere o valor e grava Notification.
- Pedido personalizado com 1–4 imagens (validação por bytes, ≤5 MB, honeypot) → status `nova`.
- Admin com senha + cookie assinado: pedidos (filtro/status, rastreio, botão "Abrir no Bambu Studio"/baixar .3mf por item), produtos (criar/editar/arquivar/excluir, variações e preço, fotos e vídeo com ordem e capa, .3mf interno, frete embutido, peso e caixa), frete (CEP de origem, frete grátis acima de, frete fixo de reserva), sob medida, avisos.
- Frete pelo CEP (Melhor Envio, com reserva em frete fixo enquanto não há token) na página da peça, carrinho e checkout; cliente escolhe a transportadora (mais barata marcada). Retirada removida. Checkout exige nome e sobrenome, email, telefone e endereço com CEP que preenche rua/bairro/cidade/UF (ViaCEP). Rastreio salvo no pedido manda email pelo Resend quando configurado.
- Testes vitest de frete (crédito embutido, limite grátis), Melhor Envio, link do .3mf, rastreio, formulário de produto, checkout e status. Visual claro e arredondado (cartões com sombra, pílulas, Figtree) aplicado na loja; admin herda os tokens.
- Banco em Postgres hospedado (Neon), o mesmo em dev local e no deploy.
- Deploy no Railway (projeto `yumi-mix`, serviço `loja`, https://yumimix.com.br e https://yumimix.up.railway.app): builda a `main` do GitHub (`MiharaxD/Yumi-mix`), mas o push nem sempre dispara o deploy sozinho — se não aparecer deploy novo, reconectar a fonte do serviço (`connect-service-source`) dispara o build; volume `uploads` montado em `/app/uploads`. O deploy antigo da Vercel (`vercel.com/mihara1/yumi-mix`) pode ser desligado.

## Pendências (prioridade)
0. Admin de produtos, frete e rastreio: código pronto e migrações aplicadas no Neon, mas nada commitado. Falta: CEP de origem em `/admin/frete`; conta Melhor Envio + `MELHOR_ENVIO_TOKEN`/`MELHOR_ENVIO_CONTACT` (sandbox primeiro, `MELHOR_ENVIO_SANDBOX=true`); domínio verificado no Resend + `RESEND_API_KEY`/`EMAIL_FROM`; essas variáveis no Railway; cadastrar frete embutido, peso e caixa reais e subir os .3mf de cada produto; testar "Abrir no Bambu Studio" com o programa instalado.
1. Mercado Pago: teste local ponta a ponta aprovado (credenciais de teste no `.env.local`), mas o código ainda não foi commitado, então o Railway roda sem MP. Falta: commit/push, variáveis `MP_*` + `APP_URL` no Railway, webhook no painel do MP com `MP_WEBHOOK_SECRET`, testar no deploy, rodar `/mp-review` e só então trocar para credenciais de produção.
2. Avisos para a dona (email/Telegram) ao gravar Notification — planejado, não iniciado.
3. Preços e dimensões dos 7 produtos são valores de teste — ajustar no admin (`/admin/produtos`).
4. Links de redes sociais no rodapé (`SOCIAL_LINKS` em `src/config.ts`) são placeholder; definir os reais.
5. A capa do suporte de lavadora ainda é o diagrama de medidas: trocar a ordem das fotos no admin (o seed não sobrescreve mais). As fotos do Kit 3 Ganchos têm etiqueta do fornecedor embutida.

## Limitações conhecidas
- Sem controle de estoque; numeração de pedido calculada por `max+1` em transação (ok para uso local).
- Railway está no trial; para manter no ar, assinar o Hobby (US$ 5). Uploads dependem do volume (um único serviço/região).
- Login do admin sem limite de tentativas além de um atraso de 500 ms.
- No Windows, o `npm run dev` às vezes serve CSS antigo após editar `globals.css`: reiniciar o servidor resolve.
- A tela de pagamento pendente/pago e as páginas internas do admin (detalhe do pedido, sob medida, avisos) foram só arredondadas, sem revisão visual dedicada no navegador.
