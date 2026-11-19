import { prisma } from "@/lib/db";
import {
  cartLeadTimeDays,
  customerShippingOptions,
  shippingCreditCents,
  subtotalCents,
  type RealShippingOption,
  type ShippingOption,
} from "@/lib/pricing";
import { melhorEnvioConfigured, quoteMelhorEnvio } from "@/lib/melhor-envio";
import { getStoreSettings } from "@/lib/settings";

export type QuotedLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  material: string;
  colorHex: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  readyToShip: boolean;
  productionDays: number;
};

/** Dados internos de cada linha (frete embutido e pacote): nunca vão para o navegador. */
type InternalLine = QuotedLine & {
  productId: string;
  shippingCreditCents: number;
  weightGrams: number;
  boxHeightCm: number;
  boxWidthCm: number;
  boxLengthCm: number;
};

/**
 * Precifica o carrinho SEMPRE a partir do banco. O navegador só informa
 * variantId e quantidade; qualquer preço enviado por ele é ignorado.
 * Peças arquivadas contam como indisponíveis.
 */
export async function quoteCartInternal(items: { variantId: string; quantity: number }[]) {
  // junta linhas repetidas da mesma variante
  const merged = new Map<string, number>();
  for (const i of items) merged.set(i.variantId, (merged.get(i.variantId) ?? 0) + i.quantity);

  const variants = await prisma.variant.findMany({
    where: { id: { in: [...merged.keys()] } },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: InternalLine[] = [];
  const unavailable: string[] = [];
  for (const [variantId, quantity] of merged) {
    const v = byId.get(variantId);
    if (!v || v.product.archived) {
      unavailable.push(variantId);
      continue;
    }
    const p = v.product;
    lines.push({
      variantId,
      productId: p.id,
      productSlug: p.slug,
      productName: p.name,
      variantName: v.name,
      material: v.material,
      colorHex: v.colorHex,
      imageUrl: p.images[0]?.url ?? null,
      unitPriceCents: v.priceCents,
      quantity,
      lineTotalCents: v.priceCents * quantity,
      readyToShip: p.readyToShip,
      productionDays: p.productionDays,
      shippingCreditCents: p.shippingCreditCents,
      weightGrams: p.weightGrams,
      boxHeightCm: p.boxHeightCm,
      boxWidthCm: p.boxWidthCm,
      boxLengthCm: p.boxLengthCm,
    });
  }

  return {
    lines,
    unavailable,
    subtotalCents: subtotalCents(lines),
    creditCents: shippingCreditCents(lines),
    leadTimeDays: cartLeadTimeDays(lines),
  };
}

/** Versão pública da cotação (sem frete embutido nem medidas). */
export async function quoteCart(items: { variantId: string; quantity: number }[]) {
  const q = await quoteCartInternal(items);
  const lines: QuotedLine[] = q.lines.map((l) => ({
    variantId: l.variantId,
    productSlug: l.productSlug,
    productName: l.productName,
    variantName: l.variantName,
    material: l.material,
    colorHex: l.colorHex,
    imageUrl: l.imageUrl,
    unitPriceCents: l.unitPriceCents,
    quantity: l.quantity,
    lineTotalCents: l.lineTotalCents,
    readyToShip: l.readyToShip,
    productionDays: l.productionDays,
  }));
  return { lines, unavailable: q.unavailable, subtotalCents: q.subtotalCents, leadTimeDays: q.leadTimeDays };
}

export type ShippingQuote = {
  /** opções como o cliente vê (já com o frete embutido abatido) */
  options: ShippingOption[];
  /** valor real por opção, para gravar no pedido */
  real: Map<string, RealShippingOption>;
  /** true quando usou o valor fixo (Melhor Envio sem token ou fora do ar) */
  fallback: boolean;
};

/** Cota o frete do carrinho para um CEP. Sem Melhor Envio, usa o valor fixo do admin. */
export async function quoteShipping(
  cep: string,
  cart: Awaited<ReturnType<typeof quoteCartInternal>>,
): Promise<ShippingQuote> {
  const settings = await getStoreSettings();
  let real: RealShippingOption[] = [];
  let fallback = true;

  if (melhorEnvioConfigured() && settings.originCep) {
    try {
      real = await quoteMelhorEnvio(
        settings.originCep,
        cep,
        cart.lines.map((l) => ({
          id: l.productId,
          quantity: l.quantity,
          weightGrams: l.weightGrams,
          heightCm: l.boxHeightCm,
          widthCm: l.boxWidthCm,
          lengthCm: l.boxLengthCm,
          unitPriceCents: l.unitPriceCents,
        })),
      );
      fallback = real.length === 0;
    } catch (e) {
      console.error("[frete] Melhor Envio falhou, usando valor fixo:", e);
    }
  }

  if (fallback) {
    real = [
      { id: "fixo", name: "Entrega", company: "", realCents: settings.fallbackShippingCents, days: settings.fallbackShippingDays },
    ];
  }

  return {
    options: customerShippingOptions(real, cart.creditCents, cart.subtotalCents, settings.freeShippingThresholdCents),
    real: new Map(real.map((o) => [o.id, o])),
    fallback,
  };
}
