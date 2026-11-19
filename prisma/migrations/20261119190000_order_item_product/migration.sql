-- Item do pedido guarda o produto, para o botão de imprimir
ALTER TABLE "OrderItem" ADD COLUMN "productId" TEXT;

-- Itens antigos: preenche pelo produto da variante
UPDATE "OrderItem" oi SET "productId" = v."productId" FROM "Variant" v WHERE oi."variantId" = v."id" AND oi."productId" IS NULL;
