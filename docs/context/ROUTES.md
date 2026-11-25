# Rotas diretas por tipo de tarefa

## Design / UI / tema
- **Ir direto para:** `DESIGN.md` (tokens e regras nomeadas) → `src/app/globals.css` (`@theme` com cores, raios `rounded-cartao/foto/campo` e sombras `shadow-cartao/alto` + classes em `@layer components`: `.titulo`, `.italico` (2ª parte do título em tom suave), `.rotulo`, `.painel`, `.cartao`, `.grade`, `.moldura`, `.foto-viva`, `.pilula`, `.chip-variante`, `.botao-principal`, `.botao-contorno`, `.botao-redondo`, `.trilho`, `.surgir`, `.check-desenha`, `.pulsar`) → `src/components/` (vitrine: `Vitrine.tsx` com `Destaques`/`CartaoDestaque`, `CategoryNav.tsx` (chips), `ProductTile.tsx`, `Prazo.tsx` (selo sobre a foto), `Icones.tsx`, `Logo.tsx` com `LogoYumiMix`) → `src/components/FotosPeca.tsx` (fotos empilhadas com dissolve: `useCicloFotos` no hover de `ProductTile`/`CartaoDestaque`, `useFotoAtiva` na `ProductGallery`) → `src/app/icon.svg` (favicon, selo da marca).
- **Testes:** visual no navegador (`npm run dev`) em 360/390/1440; `npm run lint`.
- **Cuidados:** separar com espaço e superfície, não com bordas; dourado (`dourado`, `dourado-claro`) só em detalhes, nunca como texto. Classes do visual ficam em `@layer components`, então utilitários Tailwind as sobrescrevem. Banner de campanha no topo da home: arte em `public/banners/` (`BANNER_TOPO` em `page.tsx`, texto já embutido na imagem, mantém 16:9 para não cortar). A foto do hero é fixa (`CENA_HERO` em `page.tsx`): várias fotos de fornecedor têm etiquetas de texto no topo; produtos assim entram em `COM_ETIQUETA` (`FotosPeca.tsx`), que aproxima a foto pelo canto oposto. Fotos de peça são quadradas (1024²) e preenchem a moldura (`object-cover`, moldura `aspect-square`); várias fotos na mesma moldura só via `CamadasFotos` (nunca `key` trocando a `<Image>`, que corta seco e pisca). Imagens passam pelo otimizador do Next (não use `unoptimized`: os JPGs têm ~1 MB). Grades com trilho rolável e formulários em grid precisam de `grid-cols-1`/`min-w-0` (inclusive no `fieldset`), senão estouram a largura no celular. Se o `npm run dev` servir CSS velho depois de editar `globals.css`, reinicie o servidor (ou valide com `npm run build` + `npx next start -p 3100`, config `yumi-build` do launch.json).
- **Não precisa ler:** `.impeccable/mocks`, `.impeccable/review/antigo` (rascunhos e capturas de rodadas de design).

## Páginas da loja
- **Ir direto para:** `src/app/(loja)/layout.tsx` (header fixo + `CategoryNav`/rodapé, busca categorias no banco) · home `src/app/(loja)/page.tsx` (seções por categoria + banda "Coleções") + `src/components/ProductTile.tsx` · categoria `src/app/(loja)/categoria/[slug]/page.tsx` · produto `src/app/(loja)/produto/[slug]/page.tsx` + `src/components/ProductBuy.tsx` (`ProductGallery`: fotos + vídeo `Product.videoUrl` como último item; `Variant.imageUrl` opcional = foto da cor, mostrada por cima da galeria no hover/clique da variação via `FotoVarianteProvider`, sem campo no admin ainda) · sob medida `src/app/(loja)/personalizado/` · 404 `src/app/not-found.tsx` (reexportado em `(loja)/not-found.tsx` para sair com cabeçalho).
- **Preview de link (Open Graph):** `src/app/opengraph-image.tsx` (cartão do site) e `src/app/(loja)/produto/[slug]/opengraph-image.tsx` (foto + nome + preço), helpers em `src/lib/og.ts` (`metadataBase` vem de `APP_URL` ou `RAILWAY_PUBLIC_DOMAIN`). Saem em JPEG via `sharp` (`comoJpeg`): PNG passa de ~600 KB e o WhatsApp não mostra. Testar abrindo `/opengraph-image` no navegador.
- **Cuidados:** `params`/`searchParams` são Promises (`PageProps<"/rota">`). Antes de usar API do Next, confira `node_modules/next/dist/docs/` (ver AGENTS.md).

## Compra pelos marketplaces
- **Ir direto para:** `src/components/ProductBuy.tsx` (`ProductBuy`: preço, escolha de variação e `BotaoLoja` "Comprar no Mercado Livre"/"na Shopee" em nova aba, na cor e com o logo da marca (`MARCAS`, logos em `public/marcas/`, estilo `.botao-loja` no `globals.css`); sem links mostra "Em breve") → campos `shopeeUrl`/`mercadoLivreUrl` do `Product` → zod `marketplaceUrl`/`MARKETPLACE_HOSTS` em `src/lib/product-admin.ts` → seção "Onde comprar" em `src/app/admin/(painel)/produtos/ProductForm.tsx`.
- **Testes:** `tests/admin-envio.test.ts` (links das lojas).
- **Links atuais:** `prisma/links-lojas.json` (por slug; o seed usa em produto novo, `node prisma/links-lojas.mts` preenche só campos vazios no banco). Vários links do mesmo anúncio no mesmo campo, separados por espaço: o botão alterna a cada clique (vez guardada no `localStorage`, começa sorteada).
- **Cuidados:** links só https e só dos domínios aceitos (inclui links curtos `shope.ee`/`meli.la`). Carrinho, checkout, frete do cliente e Mercado Pago foram removidos da loja; ainda sobram no admin (pedidos antigos, `/admin/frete`, rastreio) e em `src/lib/{orders,cart-server,pricing,melhor-envio,schemas,settings}.ts`.

## Uploads / sob medida (só admin)
- **Ir direto para:** `src/lib/uploads.ts` (assinatura de bytes, gravação, leitura segura) · solicitações antigas em `src/app/admin/(painel)/personalizados`. A página pública e a API `/api/personalizado` foram removidas.
- **Cuidados:** honeypot `site`; limites em `src/config.ts`; imagens só servidas por `src/app/api/admin/uploads/[id]/route.ts`.
- **Mídia de produto (admin):** upload em `src/app/api/admin/produtos/[id]/midia/route.ts` (`kind` foto/video/arquivo3d) → `uploads/produtos/` servido publicamente só por `src/app/media/[...path]/route.ts` (uuid, com Range); `.3mf` em `uploads/arquivos-3d/`, nunca público: só por `src/app/api/arquivo-3d/[productId]/[token]/[name]/route.ts` com token HMAC (`src/lib/print-files.ts`, vale `PRINT_LINK_HOURS`), porque o Bambu Studio baixa sem cookie.

## Admin / autenticação
- **Ir direto para:** `src/lib/admin-auth.ts` (cookie HMAC httpOnly) → `src/app/admin/actions.ts` (server actions) → `src/app/admin/(painel)/` (layout protegido, `page.tsx` pedidos, `pedidos/[id]` (+ `TrackingForm.tsx`), `produtos/` (`ProductForm.tsx`, `ProductMedia.tsx`), `frete/`, `personalizados`, `notificacoes`, `StatusForms.tsx`, `ui.tsx`) → `src/app/admin/product-actions.ts` + `src/lib/product-admin.ts` (zod do produto) → `src/app/admin/login/`.
- **Cuidados:** toda página/ação do painel passa por `requireAdmin`/`guard`. Formulários do admin usam `onSubmit` + `useTransition` (o `action=` do React 19 limpa os campos). Produto com venda só arquiva (excluir é bloqueado); a vitrine filtra `archived: false` em `src/lib/catalog.ts`. Envs: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (≥32 chars).

## Status (pedido e sob medida)
- **Ir direto para:** `src/lib/status.ts`. **Testes:** `tests/status.test.ts`.
- **Cuidados:** mudou fluxo? Atualize testes, rótulos e cores em `src/app/admin/(painel)/ui.tsx`.

## Banco / seed
- **Ir direto para:** `prisma/schema.prisma` (`Category` 1:N `Product`, `categoryId` opcional) → `prisma/migrations/` → `prisma/seed.mts` (2 categorias + 10 produtos reais, fotos em `public/produtos/<pasta>/main_images/*.jpg`; `videoUrl` sai de `<pasta>/product_videos/1.mp4` via `videoDaPasta`) → `src/lib/catalog.ts` (`listCategories`/`getCategoryBySlug`).
- **Cuidados:** NUNCA passe `DATABASE_URL*` como `--shadow-database-url` nem rode `migrate dev`/`reset` contra o Neon: o shadow é apagado e o banco é o mesmo da produção. Migração nova: escreva o SQL à mão (só aditivo) e aplique com `npx prisma migrate deploy` antes do push (o build do Railway não migra). Postgres (Neon), não SQLite — `DATABASE_URL`/`DATABASE_URL_UNPOOLED` ficam em `.env` (Prisma CLI não lê `.env.local`). Seed só cria categorias/produtos que faltam (nunca apaga nem sobrescreve: o catálogo é editado no admin; IDs de variante `slug--chave`). Produto novo? As pastas em `public/produtos/` trazem várias fotos com banner de marketing (texto em cima) — abra as imagens antes de escolher, só use as sem texto sobreposto no `images` do seed. Categoria nova? Adicione em `categories` e aponte o `category` de cada produto.
- **Arquivo grande?** `prisma/seed.mts` (~300 linhas): busque `const products` (catálogo) ou `draws` (desenhos).

## Build / config
- Deploy: Railway (build/start/volume/variáveis no painel, sem arquivo de config no repo).
- `package.json` (scripts), `next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`, `tsconfig.json`, `.env.example`, `.claude/launch.json` (preview `yumi-dev`).
- **Não precisa ler:** `.next/`, `node_modules/` (exceto docs do Next), `next-env.d.ts`.

## Mini-mapa
| Arquivo | Papel |
|---|---|
| `src/config.ts` | constantes de negócio (limites de upload, numeração, link do .3mf) |
| `src/lib/product-admin.ts` | zod do produto e dos links Shopee/ML |
| `src/lib/orders.ts` | pedidos antigos: rastreio, marcar pago |
| `src/lib/status.ts` | máquinas de estado |
| `src/lib/uploads.ts` | validação e IO de uploads |
| `src/lib/admin-auth.ts` | sessão do admin |
| `src/lib/db.ts` | PrismaClient singleton |
| `src/app/globals.css` | tokens e materiais do mundo visual |
