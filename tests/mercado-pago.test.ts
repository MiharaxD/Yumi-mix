import { describe, expect, it } from "vitest";
import { isPublicHttpsUrl, paymentToEvent } from "../src/lib/payments/mercado-pago-provider";

describe("paymentToEvent", () => {
  const base = { id: 123, external_reference: "pedido1", transaction_amount: 89.9, currency_id: "BRL" };

  it("aprovado vira evento approved com valor em centavos", () => {
    expect(paymentToEvent({ ...base, status: "approved" })).toEqual({
      orderId: "pedido1",
      providerPaymentId: "123",
      amountCents: 8990,
      outcome: "approved",
    });
  });

  it("recusado e cancelado viram rejected", () => {
    expect(paymentToEvent({ ...base, status: "rejected", status_detail: "cc_rejected_other_reason" })?.outcome).toBe(
      "rejected",
    );
    expect(paymentToEvent({ ...base, status: "cancelled" })?.outcome).toBe("rejected");
  });

  it("pendente, em análise, sem referência ou outra moeda não decidem nada", () => {
    expect(paymentToEvent({ ...base, status: "pending" })).toBeNull();
    expect(paymentToEvent({ ...base, status: "in_process" })).toBeNull();
    expect(paymentToEvent({ ...base, external_reference: undefined, status: "approved" })).toBeNull();
    expect(paymentToEvent({ ...base, currency_id: "USD", status: "approved" })).toBeNull();
  });
});

describe("isPublicHttpsUrl", () => {
  it("só aceita https fora de localhost", () => {
    expect(isPublicHttpsUrl("https://yumi-mix.vercel.app")).toBe(true);
    expect(isPublicHttpsUrl("http://yumi-mix.vercel.app")).toBe(false);
    expect(isPublicHttpsUrl("https://localhost:3000")).toBe(false);
    expect(isPublicHttpsUrl("http://localhost:3000")).toBe(false);
    expect(isPublicHttpsUrl(undefined)).toBe(false);
  });
});
