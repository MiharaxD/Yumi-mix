-- preço de cada anúncio: a loja mais barata ganha o selo "Promoção"
ALTER TABLE "Product" ADD COLUMN "shopeePriceCents" INTEGER;
ALTER TABLE "Product" ADD COLUMN "mercadoLivrePriceCents" INTEGER;
