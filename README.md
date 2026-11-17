# Yumi Mix — loja de impressão 3D (versão de teste)

Loja autoral em Next.js (App Router) + TypeScript + Tailwind, com SQLite via Prisma e uploads em disco.
Roda 100% local: o pagamento é simulado e nada sai da sua máquina.

## Como rodar

Requer Node 20.19+ (testado no 24).

```bash
npm install            # instala e gera o Prisma Client
cp .env.example .env.local   # e preencha os valores (veja abaixo)
npm run db:setup       # cria prisma/dev.db e carrega os 6 produtos de teste
npm run dev            # http://localhost:3000
```

- Loja: `http://localhost:3000`
- Painel: `http://localhost:3000/admin` (senha = `ADMIN_PASSWORD`)

Outros comandos: `npm run build`, `npm run lint`, `npm test`, `npm run db:seed` (recarrega o catálogo; pode rodar de novo).

> No Windows, pare o `npm run dev` antes de `npm install`/`npx prisma generate`: o servidor trava o arquivo do Prisma.

## Variáveis de ambiente (`.env.local`)

| Variável | Para quê |
| --- | --- |
| `ADMIN_PASSWORD` | Senha do painel `/admin`. |
| `ADMIN_SESSION_SECRET` | Texto aleatório (mín. 32 caracteres) que assina o cookie de sessão do admin. |

O banco é o arquivo `prisma/dev.db` (caminho fixo em `prisma/schema.prisma`). Frete, limite de frete grátis e limites de upload ficam em `src/config.ts`.

## O que dá para testar

1. Home → produto → escolher variante e quantidade → **Adicionar ao carrinho**.
2. `/carrinho` → **Finalizar compra** → preencher `/checkout` → **Ir para o pagamento** (pedido nasce `pendente`).
3. Em `/pedido/<id>/pagamento`, aba Pix ou Cartão → **Simular pagamento aprovado** (pedido vira `pago`, grava a notificação "Novo pedido pago #…" e loga no terminal) ou **recusado** (continua `pendente`).
4. `/personalizado` → enviar descrição + 1 a 4 fotos (JPG/PNG/WEBP, até 5 MB) → aparece em `/admin/personalizados` com as imagens.

Regras importantes:
- O servidor sempre recalcula preços pelo banco; o navegador só manda `variantId` e quantidade.
- A rota de simulação (`/api/pagamentos/simular`) só responde com `NODE_ENV !== "production"` (ou seja, no `npm run dev`).
- Aprovar de novo o mesmo pedido não duplica a notificação.
- Uploads ficam em `./uploads` (fora de `public/`) e só são servidos por `/api/admin/uploads/<id>` para quem está logado no admin. O tipo é conferido pelos bytes do arquivo, não pela extensão.

## Trocar o FakeProvider por um provedor real

O pagamento passa pela interface `PaymentProvider` (`src/lib/payments/provider.ts`). Para usar, por exemplo, o Mercado Pago:

1. Crie `src/lib/payments/mercado-pago-provider.ts` implementando a interface:
   - `createPixCharge(order)` → cria a cobrança Pix no provedor e devolve o copia e cola + a imagem do QR.
   - `createCardCheckout(order)` → cria o checkout hospedado e devolve a `checkoutUrl` (a loja nunca coleta dados de cartão).
   - `parseWebhook(request)` → valida a assinatura do webhook e devolve `{ orderId, outcome: "approved" | "rejected", providerPaymentId }`.
   - `isSimulated = false`.
2. Em `src/lib/payments/index.ts`, troque `new FakeProvider()` pelo novo provedor.
3. Crie a rota do webhook (ex.: `src/app/api/pagamentos/webhook/route.ts`) chamando `paymentProvider.parseWebhook(request)` e depois `handlePaymentEvent(event)` — o mesmo caminho que a simulação usa hoje, então a aprovação continua idempotente.
4. Na aba Cartão de `src/app/(loja)/pedido/[id]/pagamento/PaymentTabs.tsx`, troque os botões de simulação por um link para a `checkoutUrl`.
5. Coloque as credenciais do provedor só em `.env.local` (e adicione os nomes em `.env.example`).

Com `isSimulated = false`, os botões de simulação somem e a rota `/api/pagamentos/simular` passa a responder 404.
