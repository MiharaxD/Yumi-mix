import { describe, expect, it } from "vitest";
import {
  ORDER_STATUSES,
  canTransitionCustom,
  canTransitionOrder,
  nextCustomStatuses,
  nextOrderStatuses,
} from "@/lib/status";

describe("status do pedido", () => {
  it("segue o fluxo pendente → pago → em_producao → enviado → entregue", () => {
    expect(canTransitionOrder("pendente", "pago")).toBe(true);
    expect(canTransitionOrder("pago", "em_producao")).toBe(true);
    expect(canTransitionOrder("em_producao", "enviado")).toBe(true);
    expect(canTransitionOrder("enviado", "entregue")).toBe(true);
  });

  it("não pula etapas nem volta", () => {
    expect(canTransitionOrder("pendente", "em_producao")).toBe(false);
    expect(canTransitionOrder("pendente", "entregue")).toBe(false);
    expect(canTransitionOrder("pago", "pendente")).toBe(false);
    expect(canTransitionOrder("enviado", "pago")).toBe(false);
  });

  it("cancela antes do envio, nunca depois", () => {
    expect(canTransitionOrder("pendente", "cancelado")).toBe(true);
    expect(canTransitionOrder("pago", "cancelado")).toBe(true);
    // peça pronta pode ir direto para enviado com o rastreio
    expect(canTransitionOrder("pago", "enviado")).toBe(true);
    expect(canTransitionOrder("em_producao", "cancelado")).toBe(true);
    expect(canTransitionOrder("enviado", "cancelado")).toBe(false);
    expect(canTransitionOrder("entregue", "cancelado")).toBe(false);
  });

  it("entregue e cancelado são finais", () => {
    expect(nextOrderStatuses("entregue")).toEqual([]);
    expect(nextOrderStatuses("cancelado")).toEqual([]);
  });

  it("não aceita o mesmo status nem status desconhecido", () => {
    for (const s of ORDER_STATUSES) expect(canTransitionOrder(s, s)).toBe(false);
    expect(canTransitionOrder("pendente", "devolvido")).toBe(false);
    expect(canTransitionOrder("inventado", "pago")).toBe(false);
  });
});

describe("status do pedido personalizado", () => {
  it("nova → orcada exige preço orçado", () => {
    expect(canTransitionCustom("nova", "orcada", 14990)).toBe(true);
    expect(canTransitionCustom("nova", "orcada", null)).toBe(false);
    expect(canTransitionCustom("nova", "orcada", 0)).toBe(false);
  });

  it("orcada → aprovada ou recusada", () => {
    expect(canTransitionCustom("orcada", "aprovada", 14990)).toBe(true);
    expect(canTransitionCustom("orcada", "recusada", 14990)).toBe(true);
  });

  it("não pula o orçamento nem sai de status final", () => {
    expect(canTransitionCustom("nova", "aprovada", 14990)).toBe(false);
    expect(canTransitionCustom("nova", "recusada", null)).toBe(false);
    expect(canTransitionCustom("aprovada", "recusada", 14990)).toBe(false);
    expect(canTransitionCustom("recusada", "orcada", 14990)).toBe(false);
    expect(nextCustomStatuses("aprovada")).toEqual([]);
    expect(nextCustomStatuses("recusada")).toEqual([]);
  });
});
