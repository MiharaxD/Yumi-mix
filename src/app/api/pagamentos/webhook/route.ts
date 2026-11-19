import { handlePaymentEvent, paymentProvider } from "@/lib/payments";

/**
 * Webhook do Mercado Pago (tópico "payment"). Valida a assinatura x-signature,
 * busca o pagamento na API do MP e aplica ao pedido (aprovação idempotente).
 * Responde 200 para tudo que foi aceito, senão o MP reenvia.
 */
export async function POST(request: Request) {
  if (paymentProvider.isSimulated) return Response.json({ error: "Indisponível." }, { status: 404 });

  try {
    const parsed = await paymentProvider.parseWebhook(request);
    if (parsed.kind === "invalid") return Response.json({ error: "Assinatura inválida." }, { status: 401 });
    if (parsed.kind === "event") {
      const result = await handlePaymentEvent(parsed.event);
      console.log(`[mercadopago] webhook pedido ${parsed.event.orderId}: ${result.status}`);
    }
    return new Response(null, { status: 200 });
  } catch (e) {
    // erro temporário (rede, banco): 500 faz o MP tentar de novo depois
    console.error("[mercadopago] erro no webhook:", e instanceof Error ? e.message : e);
    return Response.json({ error: "Erro temporário." }, { status: 500 });
  }
}
