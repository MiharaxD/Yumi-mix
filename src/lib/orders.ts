import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { quoteCart } from "@/lib/cart-server";
import { FIRST_ORDER_NUMBER } from "@/config";
import type { z } from "zod";
import type { checkoutSchema } from "@/lib/schemas";

type CheckoutData = z.output<typeof checkoutSchema>;

export class CartUnavailableError extends Error {}

/** Cria o pedido com status "pendente". Preços recalculados a partir do banco. */
export async function createOrder(data: CheckoutData) {
  const quote = await quoteCart(data.items, data.deliveryMethod);
  if (quote.unavailable.length > 0 || quote.lines.length === 0) {
    throw new CartUnavailableError("Algumas peças do carrinho não estão mais disponíveis.");
  }

  // número visível sequencial; tenta de novo se dois pedidos colidirem
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const last = await tx.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
        const number = Math.max(FIRST_ORDER_NUMBER, (last?.number ?? 0) + 1);
        return tx.order.create({
          data: {
            number,
            status: "pendente",
            customerName: data.customerName,
            email: data.email,
            whatsapp: data.whatsapp,
            cep: data.cep,
            street: data.street,
            streetNumber: data.streetNumber,
            city: data.city,
            uf: data.uf,
            deliveryMethod: data.deliveryMethod,
            subtotalCents: quote.subtotalCents,
            shippingCents: quote.shippingCents,
            totalCents: quote.totalCents,
            leadTimeDays: quote.leadTimeDays,
            items: {
              create: quote.lines.map((l) => ({
                variantId: l.variantId,
                productName: l.productName,
                variantName: `${l.variantName} · ${l.material}`,
                unitPriceCents: l.unitPriceCents,
                quantity: l.quantity,
              })),
            },
          },
          select: { id: true, number: true },
        });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  throw new Error("Não foi possível numerar o pedido.");
}

export type MarkPaidResult = { status: "paid" | "already_paid" | "not_found" | "invalid_status"; orderNumber?: number };

/**
 * Marca o pedido como pago. Idempotente: repetir não muda nada nem
 * duplica a notificação (a chave única da Notification garante isso).
 */
export async function markOrderPaid(orderId: string): Promise<MarkPaidResult> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, select: { id: true, number: true, status: true } });
    if (!order) return { status: "not_found" };
    if (order.status !== "pendente") {
      return { status: order.status === "cancelado" ? "invalid_status" : "already_paid", orderNumber: order.number };
    }

    const updated = await tx.order.updateMany({
      where: { id: orderId, status: "pendente" },
      data: { status: "pago", paidAt: new Date() },
    });
    if (updated.count === 0) return { status: "already_paid", orderNumber: order.number };

    const key = `pedido-pago:${order.id}`;
    const message = `Novo pedido pago #${order.number}`;
    await tx.notification.upsert({
      where: { key },
      update: {},
      create: { key, message, orderId: order.id },
    });
    console.log(`[notificação] ${message}`);
    return { status: "paid", orderNumber: order.number };
  });
}
