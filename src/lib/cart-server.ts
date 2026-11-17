import { prisma } from "@/lib/db";
import { cartLeadTimeDays, computeTotals, type DeliveryMethod } from "@/lib/pricing";

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

/**
 * Precifica o carrinho SEMPRE a partir do banco. O navegador só informa
 * variantId e quantidade; qualquer preço enviado por ele é ignorado.
 */
export async function quoteCart(
  items: { variantId: string; quantity: number }[],
  deliveryMethod: DeliveryMethod,
) {
  // junta linhas repetidas da mesma variante
  const merged = new Map<string, number>();
  for (const i of items) merged.set(i.variantId, (merged.get(i.variantId) ?? 0) + i.quantity);

  const variants = await prisma.variant.findMany({
    where: { id: { in: [...merged.keys()] } },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: QuotedLine[] = [];
  const unavailable: string[] = [];
  for (const [variantId, quantity] of merged) {
    const v = byId.get(variantId);
    if (!v) {
      unavailable.push(variantId);
      continue;
    }
    lines.push({
      variantId,
      productSlug: v.product.slug,
      productName: v.product.name,
      variantName: v.name,
      material: v.material,
      colorHex: v.colorHex,
      imageUrl: v.product.images[0]?.url ?? null,
      unitPriceCents: v.priceCents,
      quantity,
      lineTotalCents: v.priceCents * quantity,
      readyToShip: v.product.readyToShip,
      productionDays: v.product.productionDays,
    });
  }

  const totals = computeTotals(lines, deliveryMethod);
  return { lines, unavailable, ...totals, leadTimeDays: cartLeadTimeDays(lines) };
}
