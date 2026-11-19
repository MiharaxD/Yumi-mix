import { READY_TO_SHIP_DAYS } from "@/config";

export type PricedLine = { unitPriceCents: number; quantity: number };

export function subtotalCents(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
}

/** Frete embutido do carrinho: soma do crédito de cada unidade. */
export function shippingCreditCents(lines: { shippingCreditCents: number; quantity: number }[]): number {
  return lines.reduce((sum, l) => sum + Math.max(0, l.shippingCreditCents) * l.quantity, 0);
}

/** Opção de frete com o valor REAL cotado (interno, nunca vai para o navegador). */
export type RealShippingOption = { id: string; name: string; company: string; realCents: number; days: number };

/** Opção de frete como o cliente vê: só o que ele paga. */
export type ShippingOption = { id: string; name: string; company: string; priceCents: number; days: number };

/**
 * Valor que o cliente paga em cada opção: frete real menos o frete embutido.
 * A partir do limite de frete grátis, a opção mais barata sai de graça
 * (o crédito passa a valer pelo menos o preço dela). Nunca fica negativo.
 */
export function customerShippingOptions(
  options: RealShippingOption[],
  creditCents: number,
  subtotal: number,
  freeThresholdCents: number | null,
): ShippingOption[] {
  if (options.length === 0) return [];
  const cheapest = Math.min(...options.map((o) => o.realCents));
  const freeByValue = freeThresholdCents !== null && subtotal >= freeThresholdCents;
  const credit = freeByValue ? Math.max(creditCents, cheapest) : creditCents;
  return options
    .map((o) => ({ id: o.id, name: o.name, company: o.company, days: o.days, priceCents: Math.max(0, o.realCents - credit) }))
    .sort((a, b) => a.priceCents - b.priceCents || a.days - b.days);
}

/** Quanto falta para o frete grátis (0 se já atingiu, null se não existe limite). */
export function missingForFreeShipping(subtotal: number, freeThresholdCents: number | null): number | null {
  if (freeThresholdCents === null) return null;
  return Math.max(0, freeThresholdCents - subtotal);
}

/** Prazo de uma peça: pronta entrega usa o prazo curto; senão, o de produção. */
export function itemLeadTimeDays(p: { readyToShip: boolean; productionDays: number }): number {
  return p.readyToShip ? READY_TO_SHIP_DAYS : p.productionDays;
}

/** Carrinho misto envia tudo junto: vale o maior prazo. */
export function cartLeadTimeDays(lines: { readyToShip: boolean; productionDays: number }[]): number {
  return lines.reduce((max, l) => Math.max(max, itemLeadTimeDays(l)), 0);
}
