import { describe, expect, it } from "vitest";
import {
  cartLeadTimeDays,
  customerShippingOptions,
  itemLeadTimeDays,
  missingForFreeShipping,
  shippingCreditCents,
  subtotalCents,
  type RealShippingOption,
} from "@/lib/pricing";
import { READY_TO_SHIP_DAYS } from "@/config";
import { centsToInput, formatBRL, parseBRLToCents } from "@/lib/money";

describe("subtotal", () => {
  it("soma preço unitário × quantidade", () => {
    expect(subtotalCents([{ unitPriceCents: 8990, quantity: 2 }, { unitPriceCents: 3490, quantity: 1 }])).toBe(21470);
  });
  it("carrinho vazio vale zero", () => {
    expect(subtotalCents([])).toBe(0);
  });
});

describe("frete embutido", () => {
  it("soma o crédito de cada unidade", () => {
    expect(shippingCreditCents([{ shippingCreditCents: 1000, quantity: 2 }, { shippingCreditCents: 500, quantity: 1 }])).toBe(2500);
  });
  it("ignora crédito negativo", () => {
    expect(shippingCreditCents([{ shippingCreditCents: -300, quantity: 3 }])).toBe(0);
  });
});

describe("opções de frete do cliente", () => {
  const real: RealShippingOption[] = [
    { id: "sedex", name: "SEDEX", company: "Correios", realCents: 3200, days: 2 },
    { id: "pac", name: "PAC", company: "Correios", realCents: 1800, days: 6 },
    { id: "jadlog", name: ".Package", company: "Jadlog", realCents: 1800, days: 5 },
  ];

  it("desconta o frete embutido e ordena pela mais barata", () => {
    const out = customerShippingOptions(real, 1000, 5000, 20000);
    expect(out.map((o) => [o.id, o.priceCents])).toEqual([
      ["jadlog", 800],
      ["pac", 800],
      ["sedex", 2200],
    ]);
  });
  it("crédito maior que o frete vira frete grátis, nunca negativo", () => {
    const out = customerShippingOptions(real, 2000, 5000, 20000);
    expect(out.find((o) => o.id === "pac")?.priceCents).toBe(0);
    expect(out.find((o) => o.id === "sedex")?.priceCents).toBe(1200);
  });
  it("a partir do limite, a mais barata sai de graça e as outras pagam a diferença", () => {
    const out = customerShippingOptions(real, 0, 20000, 20000);
    expect(out[0].priceCents).toBe(0);
    expect(out.find((o) => o.id === "sedex")?.priceCents).toBe(1400);
  });
  it("sem limite configurado, só vale o crédito", () => {
    expect(customerShippingOptions(real, 0, 999999, null)[0].priceCents).toBe(1800);
  });
  it("nunca expõe o valor real", () => {
    const [first] = customerShippingOptions(real, 0, 0, null);
    expect(first).not.toHaveProperty("realCents");
  });
  it("sem opções, lista vazia", () => {
    expect(customerShippingOptions([], 1000, 0, 20000)).toEqual([]);
  });
  it("quanto falta para o frete grátis", () => {
    expect(missingForFreeShipping(15000, 20000)).toBe(5000);
    expect(missingForFreeShipping(25000, 20000)).toBe(0);
    expect(missingForFreeShipping(1000, null)).toBeNull();
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
  it("mostra centavos no formato do campo", () => {
    expect(centsToInput(3990)).toBe("39,90");
    expect(parseBRLToCents(centsToInput(108990))).toBe(108990);
  });
});
