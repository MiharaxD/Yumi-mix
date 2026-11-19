import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { quoteCartInternal, quoteShipping } from "@/lib/cart-server";
import { FIRST_ORDER_NUMBER } from "@/config";
import { canTransitionOrder } from "@/lib/status";
import { emailConfigured, sendEmail, trackingEmail } from "@/lib/email";
import type { z } from "zod";
import type { checkoutSchema } from "@/lib/schemas";

type CheckoutData = z.output<typeof checkoutSchema>;

export class CartUnavailableError extends Error {}
export class ShippingOptionError extends Error {}

/** Cria o pedido com status "pendente". Preços recalculados a partir do banco. */
export async function createOrder(data: CheckoutData) {
  const quote = await quoteCartInternal(data.items);
  if (quote.unavailable.length > 0 || quote.lines.length === 0) {
    throw new CartUnavailableError("Algumas peças do carrinho não estão mais disponíveis.");
  }

  // frete cotado de novo no servidor: o navegador só escolhe a opção
  const shipping = await quoteShipping(data.cep, quote);
  const option = shipping.options.find((o) => o.id === data.shippingOptionId);
  const real = shipping.real.get(data.shippingOptionId);
  if (!option || !real) {
    throw new ShippingOptionError("O frete mudou. Confira as opções de entrega e escolha de novo.");
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
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            uf: data.uf,
            deliveryMethod: "entrega",
            subtotalCents: quote.subtotalCents,
            shippingCents: option.priceCents,
            shippingRealCents: real.realCents,
            shippingServiceId: option.id,
            shippingServiceName: option.company ? `${option.company} ${option.name}` : option.name,
            shippingDays: option.days,
            totalCents: quote.subtotalCents + option.priceCents,
            leadTimeDays: quote.leadTimeDays,
            items: {
              create: quote.lines.map((l) => ({
                variantId: l.variantId,
                productId: l.productId,
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

/** Código de rastreio: letras, números e hífen (Correios: AA123456789BR). */
export function normalizeTrackingCode(raw: string): string | null {
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  return /^[A-Z0-9-]{6,40}$/.test(code) ? code : null;
}

export type ShipResult =
  | { status: "ok"; emailed: boolean; emailError?: string }
  | { status: "not_found" | "invalid_status" | "conflict" };

/**
 * Registra o rastreio e passa o pedido para "enviado" (ou só corrige o código
 * se ele já estava enviado). Depois tenta mandar o email ao cliente.
 */
export async function shipOrder(orderId: string, code: string, appUrl: string | null): Promise<ShipResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { status: "not_found" };

  if (order.status === "enviado") {
    await prisma.order.update({ where: { id: orderId }, data: { trackingCode: code, trackingEmailSentAt: null } });
  } else {
    if (!canTransitionOrder(order.status, "enviado")) return { status: "invalid_status" };
    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: "enviado", trackingCode: code, shippedAt: new Date(), trackingEmailSentAt: null },
    });
    if (updated.count === 0) return { status: "conflict" };
  }

  return sendTrackingEmail(orderId, appUrl);
}

/** Manda (ou reenvia) o email de rastreio. Grava a data do envio quando dá certo. */
export async function sendTrackingEmail(orderId: string, appUrl: string | null): Promise<ShipResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.trackingCode) return { status: "not_found" };
  if (!emailConfigured()) {
    return { status: "ok", emailed: false, emailError: "Email ainda não configurado (RESEND_API_KEY e EMAIL_FROM)." };
  }
  const msg = trackingEmail({
    customerName: order.customerName,
    number: order.number,
    code: order.trackingCode,
    service: order.shippingServiceName,
    orderUrl: appUrl ? `${appUrl}/pedido/${order.id}/pagamento` : null,
  });
  try {
    await sendEmail({ to: order.email, ...msg });
    await prisma.order.update({ where: { id: orderId }, data: { trackingEmailSentAt: new Date() } });
    return { status: "ok", emailed: true };
  } catch (e) {
    console.error("[email] rastreio não enviado:", e);
    return { status: "ok", emailed: false, emailError: "O email não saiu. Tente reenviar em instantes." };
  }
}
