# Yumi Mix — loja de impressão 3D (versão de teste)

Loja autoral em Next.js (App Router) + TypeScript + Tailwind, com Postgres (Neon) via Prisma e uploads em disco.
O pagamento usa o Mercado Pago (Checkout Pro) quando há credenciais, ou é simulado no dev; o banco é hospedado (Neon) e compartilhado entre o `npm run dev` local e o deploy no Railway.

## Como rodar

Requer Node 20.19+ (testado no 24).

```bash
npm install            # instala e gera o Prisma Client
cp .env.example .env.local   # ADMIN_PASSWORD / ADMIN_SESSION_SECRET
# crie também um arquivo .env com DATABASE_URL e DATABASE_URL_UNPOOLED (Postgres/Neon,
# copiados em vercel.com/mihara1/yumi-mix → Storage) — o Prisma CLI só lê .env, não .env.local
npm run db:setup       # roda as migrations no Postgres e carrega os 6 produtos de teste
npm run dev            # http://localhost:3000
```

- Loja: `http://localhost:3000`
- Painel: `http://localhost:3000/admin` (senha = `ADMIN_PASSWORD`)

Outros comandos: `npm run build`, `npm run lint`, `npm test`, `npm run db:seed` (recarrega o catálogo; pode rodar de novo).

> No Windows, pare o `npm run dev` antes de `npm install`/`npx prisma generate`: o servidor trava o arquivo do Prisma.

## Variáveis de ambiente

| Variável | Arquivo | Para quê |
| --- | --- | --- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | `.env` | Conexão com o Postgres (Neon); mesmo banco usado no deploy. |
| `ADMIN_PASSWORD` | `.env.local` | Senha do painel `/admin`. |
| `ADMIN_SESSION_SECRET` | `.env.local` | Texto aleatório (mín. 32 caracteres) que assina o cookie de sessão do admin. |
| `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET`, `APP_URL` | `.env.local` | Mercado Pago (ver seção abaixo). Sem token, pagamento simulado. |

O banco é Postgres (Neon), compartilhado entre o `npm run dev` local e o deploy no Railway — schema fixo em `prisma/schema.prisma`. Frete, limite de frete grátis e limites de upload ficam em `src/config.ts`.

## O que dá para testar

1. Home → produto → escolher variante e quantidade → **Adicionar ao carrinho**.
2. `/carrinho` → **Finalizar compra** → preencher `/checkout` → **Ir para o pagamento** (pedido nasce `pendente`).
3. Em `/pedido/<id>/pagamento`: com Mercado Pago, **Pagar com Mercado Pago** (ver seção abaixo); sem ele, aba Pix ou Cartão → **Simular pagamento aprovado** (pedido vira `pago`, grava a notificação "Novo pedido pago #…" e loga no terminal) ou **recusado** (continua `pendente`).
4. `/personalizado` → enviar descrição + 1 a 4 fotos (JPG/PNG/WEBP, até 5 MB) → aparece em `/admin/personalizados` com as imagens.

Regras importantes:
- O servidor sempre recalcula preços pelo banco; o navegador só manda `variantId` e quantidade.
- A rota de simulação (`/api/pagamentos/simular`) só responde com `NODE_ENV !== "production"` (ou seja, no `npm run dev`).
- Aprovar de novo o mesmo pedido não duplica a notificação.
- Uploads ficam em `./uploads` (fora de `public/`) e só são servidos por `/api/admin/uploads/<id>` para quem está logado no admin. O tipo é conferido pelos bytes do arquivo, não pela extensão.

## Pagamento com Mercado Pago (Checkout Pro)

Com `MP_ACCESS_TOKEN` definido, a página `/pedido/<id>/pagamento` mostra o botão **Pagar com Mercado Pago**: o cliente vai para a página segura do MP (Pix, cartão, débito, saldo) e volta para a mesma página. Sem o token, a loja usa o pagamento simulado (só no `npm run dev`).

- `src/lib/payments/mercado-pago-provider.ts`: cria a preferência (itens e frete do banco, `external_reference` = id do pedido), consulta pagamentos e valida o webhook (`x-signature` via `WebhookSignatureValidator` do SDK).
- `POST /api/pagamentos/checkout`: recebe `orderId`, cria a preferência e redireciona para o `init_point`.
- `POST /api/pagamentos/webhook`: tópico `payment`; busca o pagamento na API e chama `handlePaymentEvent` (aprovação idempotente, confere o valor pago com o total do pedido).
- Na volta (`?payment_id=`), a página consulta o pagamento na API e já marca o pedido como pago. Se o cliente não voltar pelo link, abrir a página de um pedido pendente busca na API um pagamento aprovado com `external_reference` do pedido; assim o teste local funciona sem webhook.

Configuração: credenciais em `.env.local` (nomes em `.env.example`) e as mesmas variáveis no Railway. Webhook: no painel do MP → app → Webhooks, URL `https://<sua-loja>/api/pagamentos/webhook`, evento **Pagamentos**; copie a assinatura secreta para `MP_WEBHOOK_SECRET`. Para testar, entre no checkout com o **comprador de teste** do app (painel → Contas de teste) e use cartões de teste (nome `APRO` aprova, `OTHE` recusa).
