# Rotas diretas por tipo de tarefa

## Design / UI / tema
- **Ir direto para:** `DESIGN.md` (tokens e regras nomeadas) → `src/app/globals.css` (`@theme` com cores, raios `rounded-cartao/foto/campo` e sombras `shadow-cartao/alto` + classes em `@layer components`: `.titulo`, `.italico` (2ª parte do título em tom suave), `.rotulo`, `.painel`, `.cartao`, `.grade`, `.moldura`, `.foto-viva`, `.pilula`, `.chip-variante`, `.botao-principal`, `.botao-contorno`, `.botao-redondo`, `.trilho`, `.surgir`, `.check-desenha`, `.pulsar`) → `src/components/` (vitrine: `Vitrine.tsx` com `Destaques`/`CartaoDestaque`, `CategoryNav.tsx` (chips), `CartLink.tsx`, `ProductTile.tsx`, `Prazo.tsx` (selo sobre a foto), `Icones.tsx`, `Logo.tsx` com `LogoYumiMix`) → `src/components/FotosPeca.tsx` (fotos empilhadas com dissolve: `useCicloFotos` no hover de `ProductTile`/`CartaoDestaque`, `useFotoAtiva` na `ProductGallery`) → `src/app/icon.svg` (favicon, selo da marca).
- **Testes:** visual no navegador (`npm run dev`) em 360/390/1440; `npm run lint`.
- **Cuidados:** separar com espaço e superfície, não com bordas; dourado (`dourado`, `dourado-claro`) só em detalhes, nunca como texto. Classes do visual ficam em `@layer components`, então utilitários Tailwind as sobrescrevem. A foto do hero é fixa (`CENA_HERO` em `page.tsx`): várias fotos de fornecedor têm etiquetas de texto no topo; produtos assim entram em `COM_ETIQUETA` (`FotosPeca.tsx`), que aproxima a foto pelo canto oposto. Fotos de peça são quadradas (1024²) e preenchem a moldura (`object-cover`, moldura `aspect-square`); várias fotos na mesma moldura só via `CamadasFotos` (nunca `key` trocando a `<Image>`, que corta seco e pisca). Imagens passam pelo otimizador do Next (não use `unoptimized`: os JPGs têm ~1 MB). Grades com trilho rolável e formulários em grid precisam de `grid-cols-1`/`min-w-0` (inclusive no `fieldset`), senão estouram a largura no celular. Se o `npm run dev` servir CSS velho depois de editar `globals.css`, reinicie o servidor (ou valide com `npm run build` + `npx next start -p 3100`, config `yumi-build` do launch.json).
- **Não precisa ler:** `.impeccable/mocks`, `.impeccable/review/antigo` (rascunhos e capturas de rodadas de design).

## Páginas da loja
- **Ir direto para:** `src/app/(loja)/layout.tsx` (header fixo + `CategoryNav`/rodapé, busca categorias no banco) · home `src/app/(loja)/page.tsx` (seções por categoria + banda "Coleções") + `src/components/ProductTile.tsx` · categoria `src/app/(loja)/categoria/[slug]/page.tsx` · produto `src/app/(loja)/produto/[slug]/page.tsx` + `src/components/ProductBuy.tsx` · carrinho `src/app/(loja)/carrinho/CartView.tsx` · checkout `src/app/(loja)/checkout/CheckoutForm.tsx` · pagamento `src/app/(loja)/pedido/[id]/pagamento/` · sob medida `src/app/(loja)/personalizado/` · 404 `src/app/not-found.tsx` (reexportado em `(loja)/not-found.tsx` para sair com cabeçalho).
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
- **Ir direto para:** `prisma/schema.prisma` (`Category` 1:N `Product`, `categoryId` opcional) → `prisma/migrations/` → `prisma/seed.mts` (2 categorias + 7 produtos reais, fotos em `public/produtos/<pasta>/main_images/*.jpg`) → `src/lib/catalog.ts` (`listCategories`/`getCategoryBySlug`).
- **Cuidados:** Postgres (Neon), não SQLite — `DATABASE_URL`/`DATABASE_URL_UNPOOLED` ficam em `.env` (Prisma CLI não lê `.env.local`). Seed é idempotente (upsert, IDs de variante `slug--chave` estáveis; produtos/categorias fora da lista do seed são removidos). Produto novo? As pastas em `public/produtos/` trazem várias fotos com banner de marketing (texto em cima) — abra as imagens antes de escolher, só use as sem texto sobreposto no `images` do seed. Categoria nova? Adicione em `categories` e aponte o `category` de cada produto.
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
