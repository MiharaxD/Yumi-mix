import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { FakeProvider } from "./fake-provider";
import type { PaymentEvent, PaymentProvider } from "./provider";

/** Provedor ativo. Para ir para produção, troque por um provedor real. */
export const paymentProvider: PaymentProvider = new FakeProvider();

/** Simulação só existe fora de produção. */
export function simulationEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && paymentProvider.isSimulated;
}

export type PaymentEventResult =
  | { ok: true; status: "pago"; orderNumber: number; alreadyPaid: boolean }
  | { ok: false; status: "recusado" | "nao_encontrado" | "status_invalido"; message: string };

/**
 * Aplica um evento de pagamento ao pedido. É o que o webhook real chamará.
 * Aprovação é idempotente; recusa mantém o pedido "pendente".
 */
export async function handlePaymentEvent(event: PaymentEvent): Promise<PaymentEventResult> {
  if (event.outcome === "approved") {
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
