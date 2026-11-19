import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { FakeProvider } from "./fake-provider";
import { MercadoPagoProvider } from "./mercado-pago-provider";
import type { OrderForPayment, PaymentEvent, PaymentProvider } from "./provider";

/** URL pública da loja (APP_URL), sem barra no fim. */
export function appUrl(): string | undefined {
  return process.env.APP_URL?.trim().replace(/\/+$/, "") || undefined;
}

/** Mercado Pago quando há token; senão, a simulação (que só funciona fora de produção). */
function pickProvider(): PaymentProvider {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (token) {
    return new MercadoPagoProvider(token, process.env.MP_WEBHOOK_SECRET?.trim() || undefined, appUrl());
  }
  if (process.env.NODE_ENV === "production") {
    console.error("[pagamento] Mercado Pago sem token configurado: pagamentos indisponíveis.");
  }
  return new FakeProvider();
}

/** Provedor ativo. */
export const paymentProvider: PaymentProvider = pickProvider();

/** Simulação só existe fora de produção e sem provedor real. */
export function simulationEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && paymentProvider.isSimulated;
}

export type PaymentEventResult =
  | { ok: true; status: "pago"; orderNumber: number; alreadyPaid: boolean }
  | { ok: false; status: "recusado" | "nao_encontrado" | "status_invalido"; message: string };

/**
 * Aplica um evento de pagamento ao pedido (webhook, volta do checkout ou simulação).
 * Aprovação é idempotente; recusa mantém o pedido "pendente".
 */
export async function handlePaymentEvent(event: PaymentEvent): Promise<PaymentEventResult> {
  if (event.outcome === "approved") {
    // o valor pago tem de bater com o total do pedido (calculado no servidor)
    if (event.amountCents !== undefined) {
      const order = await prisma.order.findUnique({ where: { id: event.orderId }, select: { totalCents: true } });
      if (!order) return { ok: false, status: "nao_encontrado", message: "Pedido não encontrado." };
      if (order.totalCents !== event.amountCents) {
        console.error(
          `[pagamento] valor divergente no pedido ${event.orderId}: pago ${event.amountCents}, esperado ${order.totalCents} (pagamento ${event.providerPaymentId})`,
        );
        return { ok: false, status: "status_invalido", message: "O valor pago não confere com o pedido." };
      }
    }
    const r = await markOrderPaid(event.orderId);
    if (r.status === "not_found") return { ok: false, status: "nao_encontrado", message: "Pedido não encontrado." };
    if (r.status === "invalid_status")
      return { ok: false, status: "status_invalido", message: "Este pedido foi cancelado e não pode ser pago." };
    return { ok: true, status: "pago", orderNumber: r.orderNumber!, alreadyPaid: r.status === "already_paid" };
  }

  const order = await prisma.order.findUnique({ where: { id: event.orderId }, select: { id: true } });
  if (!order) return { ok: false, status: "nao_encontrado", message: "Pedido não encontrado." };
  console.log(`[pagamento] recusado para o pedido ${event.orderId}: ${event.reason ?? "sem motivo"}`);
  return {
    ok: false,
    status: "recusado",
    message: event.reason ?? "Pagamento recusado. Seu pedido continua pendente.",
  };
}

/** Carrega o pedido no formato que o provedor precisa. */
export async function loadOrderForPayment(orderId: string): Promise<(OrderForPayment & { status: string }) | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      number: true,
      status: true,
      totalCents: true,
      shippingCents: true,
      customerName: true,
      email: true,
      items: { select: { productName: true, variantName: true, unitPriceCents: true, quantity: true } },
    },
  });
}
