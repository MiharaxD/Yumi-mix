import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  READY_TO_SHIP_DAYS,
  SHIPPING_FEE_CENTS,
} from "@/config";

export type DeliveryMethod = "retirada" | "entrega";

export type PricedLine = { unitPriceCents: number; quantity: number };

export type ShippingRules = {
  feeCents: number;
  freeThresholdCents: number | null;
};

const defaultRules: ShippingRules = {
  feeCents: SHIPPING_FEE_CENTS,
  freeThresholdCents: FREE_SHIPPING_THRESHOLD_CENTS,
};

export function subtotalCents(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
}

export function shippingCents(
  subtotal: number,
  method: DeliveryMethod,
  rules: ShippingRules = defaultRules,
): number {
  if (method === "retirada") return 0;
  if (subtotal <= 0) return 0;
  if (rules.freeThresholdCents !== null && subtotal >= rules.freeThresholdCents) return 0;
  return rules.feeCents;
}

export function computeTotals(
  lines: PricedLine[],
  method: DeliveryMethod,
  rules: ShippingRules = defaultRules,
) {
  const subtotal = subtotalCents(lines);
  const shipping = shippingCents(subtotal, method, rules);
  return { subtotalCents: subtotal, shippingCents: shipping, totalCents: subtotal + shipping };
}

/** Quanto falta para o frete grátis (0 se já atingiu, null se não existe limite). */
export function missingForFreeShipping(
  subtotal: number,
  rules: ShippingRules = defaultRules,
): number | null {
  if (rules.freeThresholdCents === null) return null;
  return Math.max(0, rules.freeThresholdCents - subtotal);
}

/** Prazo de uma peça: pronta entrega usa o prazo curto; senão, o de produção. */
export function itemLeadTimeDays(p: { readyToShip: boolean; productionDays: number }): number {
  return p.readyToShip ? READY_TO_SHIP_DAYS : p.productionDays;
}

/** Carrinho misto envia tudo junto: vale o maior prazo. */
export function cartLeadTimeDays(items: { readyToShip: boolean; productionDays: number }[]): number {
  return items.reduce((max, i) => Math.max(max, itemLeadTimeDays(i)), 0);
}
