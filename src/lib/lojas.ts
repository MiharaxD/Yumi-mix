// Lojas (marketplaces) de uma peça: links, preço de cada anúncio e qual está em promoção.

export type MarcaLoja = { nome: string; fundo: string; texto: string; logo: string; logoLargura: number };
export const MARCAS: Record<"ml" | "shopee", MarcaLoja> = {
  ml: { nome: "Mercado Livre", fundo: "#ffe600", texto: "#2d3277", logo: "/marcas/mercado-livre.png", logoLargura: 43 },
  shopee: { nome: "Shopee", fundo: "#ed4c2d", texto: "#ffffff", logo: "/marcas/shopee.png", logoLargura: 26 },
};

export type LojasInput = {
  shopeeUrl?: string | null;
  mercadoLivreUrl?: string | null;
  shopeePriceCents?: number | null;
  mercadoLivrePriceCents?: number | null;
};

function separarLinks(valor: string | null | undefined): string[] {
  return (valor ?? "").split(/\s+/).filter(Boolean);
}

/** Lojas com link cadastrado, Mercado Livre primeiro. Com as duas e preços diferentes, a mais barata vira `promocao`. */
export function lojasDaPeca(p: LojasInput) {
  const lojas = [
    { chave: "ml", prefixo: "no", urls: separarLinks(p.mercadoLivreUrl), marca: MARCAS.ml, precoCents: p.mercadoLivrePriceCents ?? null, promocao: false },
    { chave: "shopee", prefixo: "na", urls: separarLinks(p.shopeeUrl), marca: MARCAS.shopee, precoCents: p.shopeePriceCents ?? null, promocao: false },
  ].filter((l) => l.urls.length > 0);

  const [a, b] = lojas;
  if (a && b && a.precoCents != null && b.precoCents != null && a.precoCents !== b.precoCents) {
    (a.precoCents < b.precoCents ? a : b).promocao = true;
  }
  return lojas;
}

export type Loja = ReturnType<typeof lojasDaPeca>[number];
