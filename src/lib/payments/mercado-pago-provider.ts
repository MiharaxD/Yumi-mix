import { randomUUID } from "node:crypto";
import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  Payment,
  Preference,
  WebhookSignatureValidator,
} from "mercadopago";
import type { OrderForPayment, PaymentEvent, PaymentProvider, WebhookResult } from "./provider";

/** URL pública https (não local): só ela aceita auto_return e recebe webhook. */
export function isPublicHttpsUrl(url: string | undefined): url is string {
  if (!url || !/^https:\/\//i.test(url)) return false;
  return !/^https:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(url);
}

const toReais = (cents: number) => Math.round(cents) / 100;

type MpPayment = {
  id?: number | string;
  status?: string;
  status_detail?: string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
};

/** Converte o pagamento do MP no evento da loja. null = ainda sem decisão (pendente, em análise). */
export function paymentToEvent(p: MpPayment): PaymentEvent | null {
  if (!p.id || !p.external_reference) return null;
  const base = {
    orderId: p.external_reference,
    providerPaymentId: String(p.id),
    amountCents: p.transaction_amount != null ? Math.round(p.transaction_amount * 100) : undefined,
  };
  if (p.status === "approved") {
    if (p.currency_id && p.currency_id !== "BRL") return null;
    return { ...base, outcome: "approved" };
  }
  if (p.status === "rejected" || p.status === "cancelled") {
    return { ...base, outcome: "rejected", reason: `Pagamento ${p.status} (${p.status_detail ?? "sem detalhe"}).` };
  }
  return null;
}

/** Checkout Pro do Mercado Pago: o cliente paga (Pix, cartão, saldo) na página do MP. */
export class MercadoPagoProvider implements PaymentProvider {
  readonly id = "mercadopago";
  readonly isSimulated = false;
  private readonly client: MercadoPagoConfig;

  constructor(
    accessToken: string,
    private readonly webhookSecret: string | undefined,
    private readonly publicUrl: string | undefined,
  ) {
    this.client = new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
  }

  async createCheckout(order: OrderForPayment, baseUrl: string): Promise<{ url: string }> {
    const items = order.items.map((it, i) => ({
      id: `item-${i + 1}`,
      title: `${it.productName} (${it.variantName})`.slice(0, 250),
      quantity: it.quantity,
      unit_price: toReais(it.unitPriceCents),
      currency_id: "BRL",
    }));
    if (order.shippingCents > 0) {
      items.push({ id: "frete", title: "Frete", quantity: 1, unit_price: toReais(order.shippingCents), currency_id: "BRL" });
    }

    const back = `${baseUrl}/pedido/${order.id}/pagamento`;
    const publicApp = isPublicHttpsUrl(baseUrl);
    const result = await new Preference(this.client).create({
      body: {
        items,
        external_reference: order.id,
        statement_descriptor: "YUMIMIX",
        back_urls: { success: back, pending: back, failure: `${back}?mp=falhou` },
        // auto_return só com https:// público; o MP recusa back_urls em localhost com ele
        ...(publicApp ? { auto_return: "approved" } : {}),
        ...(isPublicHttpsUrl(this.publicUrl)
          ? { notification_url: `${this.publicUrl}/api/pagamentos/webhook?source_news=webhooks` }
          : {}),
        metadata: { order_number: order.number },
      },
      requestOptions: { idempotencyKey: randomUUID() },
    });

    // sempre init_point: o MP não tem mais ambiente sandbox separado
    if (!result.init_point) throw new Error("Mercado Pago não devolveu o link de pagamento.");
    return { url: result.init_point };
  }

  async getPaymentEvent(paymentId: string): Promise<PaymentEvent | null> {
    if (!/^\d{1,20}$/.test(paymentId)) return null;
    const payment = await new Payment(this.client).get({ id: paymentId });
    return paymentToEvent(payment);
  }

  async findApprovedPayment(orderId: string): Promise<PaymentEvent | null> {
    const found = await new Payment(this.client).search({
      options: { external_reference: orderId, sort: "date_created", criteria: "desc", limit: 20 },
    });
    // só o que o MP marca como aprovado e com referência exata ao pedido
    const approved = found.results?.find((p) => p.status === "approved" && p.external_reference === orderId);
    return approved ? paymentToEvent(approved) : null;
  }

  async parseWebhook(request: Request): Promise<WebhookResult> {
    const url = new URL(request.url);
    const body = (await request.json().catch(() => null)) as { type?: string; data?: { id?: string | number } } | null;
    const type = url.searchParams.get("type") ?? body?.type;
    const dataId = url.searchParams.get("data.id") ?? (body?.data?.id != null ? String(body.data.id) : null);

    // só pagamentos interessam; o resto (merchant_order, IPN antigo) recebe 200 e é ignorado
    if (type !== "payment") return { kind: "ignored" };
    if (!dataId || !this.webhookSecret) {
      if (!this.webhookSecret) console.error("[mercadopago] MP_WEBHOOK_SECRET não configurado: webhook recusado.");
      return { kind: "invalid" };
    }

    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret: this.webhookSecret,
        toleranceSeconds: 600,
      });
    } catch (e) {
      if (e instanceof InvalidWebhookSignatureError) {
        console.warn(`[mercadopago] webhook com assinatura inválida: ${e.reason}`);
        return { kind: "invalid" };
      }
      throw e;
    }

    // nunca confia no corpo: busca o pagamento no MP com o nosso token
    const event = await this.getPaymentEvent(dataId);
    return event ? { kind: "event", event } : { kind: "ignored" };
  }
}
