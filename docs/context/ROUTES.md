# Rotas diretas por tipo de tarefa

## Design / UI / tema
- **Ir direto para:** `DESIGN.md` (tokens e regras nomeadas) → `src/app/globals.css` (`@theme` + classes do mundo: `.titulo`, `.italico`, `.rotulo`, `.painel`, `.grade`, `.moldura`, `.foto-viva`, `.chip-variante`, `.botao-principal`, `.botao-contorno`, `.linha-lista`, `.trilho`, `.surgir`) → `src/components/` (vitrine: `Vitrine.tsx` com `Destaques`/`ListaPecas`, `ProductTile.tsx`).
- **Testes:** visual no navegador (`npm run dev`) em 360/390/1440; `npm run lint`.
- **Cuidados:** interface só em preto e branco (cor só nas fotos e amostras). Classes do mundo ficam fora de `@layer`, então vencem utilitários Tailwind — não use shorthands que sobrescrevem utilitários (ex.: use `text-wrap-style`, não `text-wrap`). Imagem de peça sempre via `ImagemPeca` dentro de `.moldura` (vista frontal `inteira`, cena `inteira={false}`). Grades com trilho rolável precisam de `grid-cols-1`/`min-w-0`, senão estouram a largura no celular. Se o `npm run dev` servir CSS velho depois de editar `globals.css`, reinicie o servidor (ou valide com `npm run build` + `npx next start -p 3100`, config `yumi-build` do launch.json).
- **Não precisa ler:** `.impeccable/*` (espelho e capturas do visual antigo de cobogó; desatualizado).

## Páginas da loja
- **Ir direto para:** `src/app/(loja)/layout.tsx` (header fixo/rodapé) · home `src/app/(loja)/page.tsx` + `src/components/ProductTile.tsx` · produto `src/app/(loja)/produto/[slug]/page.tsx` + `src/components/ProductBuy.tsx` · carrinho `src/app/(loja)/carrinho/CartView.tsx` · checkout `src/app/(loja)/checkout/CheckoutForm.tsx` · pagamento `src/app/(loja)/pedido/[id]/pagamento/` · sob medida `src/app/(loja)/personalizado/`.
- **Cuidados:** `params`/`searchParams` são Promises (`PageProps<"/rota">`). Antes de usar API do Next, confira `node_modules/next/dist/docs/` (ver AGENTS.md).

## Carrinho e preços
- **Ir direto para:** `src/lib/cart-store.ts` (localStorage, `useSyncExternalStore`) → `src/lib/use-quote.ts` → `src/app/api/carrinho/cotacao/route.ts` → `src/lib/cart-server.ts` → `src/lib/pricing.ts` → `src/config.ts` (frete, limite grátis, prazo pronta entrega).
- **Testes:** `tests/pricing.test.ts` (`npm test`).
- **Cuidados:** nunca aceitar preço do cliente. Mudou regra de frete/prazo? Atualize `pricing.ts`, teste e textos de `CartView`/`CheckoutForm`.

## Checkout / pedidos
- **Ir direto para:** `src/lib/schemas.ts` (zod do checkout) → `src/app/api/pedidos/route.ts` → `src/lib/orders.ts` (`createOrder`, `markOrderPaid`).
- **Cuidados:** número visível sequencial (`FIRST_ORDER_NUMBER`) + `id` cuid na URL. `markOrderPaid` é o único jeito de ir para `pago`.

## Pagamento
- **Ir direto para:** `src/lib/payments/provider.ts` (interface) → `src/lib/payments/fake-provider.ts` → `src/lib/payments/index.ts` (provedor ativo, `handlePaymentEvent`, `simulationEnabled`) → `src/app/api/pagamentos/simular/route.ts` → `PaymentTabs.tsx`.
- **Cuidados:** provedor real: ver seção no `README.md`. Sem campos de cartão na loja.

## Pedido personalizado / uploads
- **Ir direto para:** `src/app/api/personalizado/route.ts` → `src/lib/uploads.ts` (assinatura de bytes, gravação, leitura segura) → `src/lib/custom-requests.ts` (zod + criação) → `src/app/(loja)/personalizado/CustomRequestForm.tsx`.
- **Cuidados:** honeypot `site`; limites em `src/config.ts`; imagens só servidas por `src/app/api/admin/uploads/[id]/route.ts`.

## Admin / autenticação
- **Ir direto para:** `src/lib/admin-auth.ts` (cookie HMAC httpOnly) → `src/app/admin/actions.ts` (server actions) → `src/app/admin/(painel)/` (layout protegido, `page.tsx` pedidos, `pedidos/[id]`, `personalizados`, `notificacoes`, `StatusForms.tsx`, `ui.tsx`) → `src/app/admin/login/`.
- **Cuidados:** toda página/ação do painel passa por `requireAdmin`/`guard`. Envs: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (≥32 chars).

## Status (pedido e sob medida)
- **Ir direto para:** `src/lib/status.ts`. **Testes:** `tests/status.test.ts`.
- **Cuidados:** mudou fluxo? Atualize testes, rótulos e cores em `src/app/admin/(painel)/ui.tsx`.

## Banco / seed
- **Ir direto para:** `prisma/schema.prisma` → `prisma/migrations/` → `prisma/seed.mts` (produtos + SVGs em `public/produtos/`).
- **Cuidados:** Postgres (Neon), não SQLite — `DATABASE_URL`/`DATABASE_URL_UNPOOLED` ficam em `.env` (Prisma CLI não lê `.env.local`). Seed é idempotente (upsert, IDs de variante `slug--chave` estáveis). Não editar `public/produtos/*.svg` à mão: são gerados pelo seed (vista frontal com fundo branco, para casar com a `.moldura`).
- **Arquivo grande?** `prisma/seed.mts` (~300 linhas): busque `const products` (catálogo) ou `draws` (desenhos).

## Build / config
- `package.json` (scripts), `next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`, `tsconfig.json`, `.env.example`, `.claude/launch.json` (preview `yumi-dev`).
- **Não precisa ler:** `.next/`, `node_modules/` (exceto docs do Next), `next-env.d.ts`.

## Mini-mapa
| Arquivo | Papel |
|---|---|
| `src/config.ts` | constantes de negócio (frete, limites, numeração) |
| `src/lib/pricing.ts` | subtotal, frete, total, prazo |
| `src/lib/cart-server.ts` | cotação do carrinho pelo banco |
| `src/lib/orders.ts` | criar pedido / marcar pago (idempotente) |
| `src/lib/status.ts` | máquinas de estado |
| `src/lib/payments/*` | contrato e FakeProvider |
| `src/lib/uploads.ts` | validação e IO de uploads |
| `src/lib/admin-auth.ts` | sessão do admin |
| `src/lib/db.ts` | PrismaClient singleton |
| `src/app/globals.css` | tokens e materiais do mundo visual |
