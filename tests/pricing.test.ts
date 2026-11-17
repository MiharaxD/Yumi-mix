import { describe, expect, it } from "vitest";
import {
  cartLeadTimeDays,
  computeTotals,
  itemLeadTimeDays,
  missingForFreeShipping,
  shippingCents,
  subtotalCents,
} from "@/lib/pricing";
import { FREE_SHIPPING_THRESHOLD_CENTS, READY_TO_SHIP_DAYS, SHIPPING_FEE_CENTS } from "@/config";
import { formatBRL, parseBRLToCents } from "@/lib/money";

const rules = { feeCents: 2000, freeThresholdCents: 20000 };

describe("subtotal", () => {
  it("soma preço unitário × quantidade", () => {
    expect(subtotalCents([{ unitPriceCents: 8990, quantity: 2 }, { unitPriceCents: 3490, quantity: 1 }])).toBe(21470);
  });
  it("carrinho vazio vale zero", () => {
    expect(subtotalCents([])).toBe(0);
  });
});

describe("frete", () => {
  it("retirada é sempre grátis", () => {
    expect(shippingCents(5000, "retirada", rules)).toBe(0);
    expect(shippingCents(50000, "retirada", rules)).toBe(0);
  });
  it("entrega abaixo do limite cobra a taxa fixa", () => {
    expect(shippingCents(19999, "entrega", rules)).toBe(2000);
  });
  it("entrega a partir do limite é grátis (limite inclusivo)", () => {
    expect(shippingCents(20000, "entrega", rules)).toBe(0);
    expect(shippingCents(35000, "entrega", rules)).toBe(0);
  });
  it("sem limite configurado, sempre cobra a taxa", () => {
    expect(shippingCents(999999, "entrega", { feeCents: 2500, freeThresholdCents: null })).toBe(2500);
  });
  it("não cobra frete de carrinho vazio", () => {
    expect(shippingCents(0, "entrega", rules)).toBe(0);
  });
  it("usa os valores de src/config.ts por padrão", () => {
    const below = (FREE_SHIPPING_THRESHOLD_CENTS ?? 1_000_000) - 1;
    expect(shippingCents(below, "entrega")).toBe(SHIPPING_FEE_CENTS);
  });
});

describe("total", () => {
  it("soma subtotal e frete", () => {
    const t = computeTotals([{ unitPriceCents: 8990, quantity: 1 }, { unitPriceCents: 6990, quantity: 1 }], "entrega", rules);
    expect(t).toEqual({ subtotalCents: 15980, shippingCents: 2000, totalCents: 17980 });
  });
  it("frete grátis quando o subtotal passa do limite", () => {
    const t = computeTotals([{ unitPriceCents: 18990, quantity: 1 }, { unitPriceCents: 3490, quantity: 1 }], "entrega", rules);
    expect(t).toEqual({ subtotalCents: 22480, shippingCents: 0, totalCents: 22480 });
  });
  it("retirada: total = subtotal", () => {
    const t = computeTotals([{ unitPriceCents: 6990, quantity: 3 }], "retirada", rules);
    expect(t.totalCents).toBe(20970);
  });
  it("quanto falta para o frete grátis", () => {
    expect(missingForFreeShipping(15000, rules)).toBe(5000);
    expect(missingForFreeShipping(25000, rules)).toBe(0);
    expect(missingForFreeShipping(1000, { feeCents: 2000, freeThresholdCents: null })).toBeNull();
  });
});

describe("prazo", () => {
  it("pronta entrega usa o prazo curto", () => {
    expect(itemLeadTimeDays({ readyToShip: true, productionDays: 5 })).toBe(READY_TO_SHIP_DAYS);
  });
  it("carrinho misto vale o maior prazo", () => {
    expect(
      cartLeadTimeDays([
        { readyToShip: true, productionDays: 5 },
        { readyToShip: false, productionDays: 7 },
        { readyToShip: false, productionDays: 3 },
      ]),
    ).toBe(7);
  });
});

describe("dinheiro", () => {
  it("formata em BRL", () => {
    expect(formatBRL(8990).replace(/\s/g, " ")).toBe("R$ 89,90");
  });
  it("lê valores digitados no admin", () => {
    expect(parseBRLToCents("149,90")).toBe(14990);
    expect(parseBRLToCents("R$ 1.089,90")).toBe(108990);
    expect(parseBRLToCents("75")).toBe(7500);
    expect(parseBRLToCents("abc")).toBeNull();
    expect(parseBRLToCents("")).toBeNull();
  });
});
