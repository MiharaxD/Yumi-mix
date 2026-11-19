import { handlePaymentEvent, paymentProvider, simulationEnabled } from "@/lib/payments";

/**
 * Faz o papel do webhook do provedor na versão de teste sem Mercado Pago.
 * Corpo: { orderId, outcome: "approved" | "rejected" }.
 * Desligada em produção e quando o Mercado Pago está configurado.
 */
export async function POST(request: Request) {
  if (!simulationEnabled()) {
    return Response.json({ error: "Simulação indisponível." }, { status: 404 });
  }

  const parsed = await paymentProvider.parseWebhook(request);
  if (parsed.kind !== "event") return Response.json({ error: "Requisição inválida." }, { status: 400 });

  const result = await handlePaymentEvent(parsed.event);
  const status = result.ok ? 200 : result.status === "nao_encontrado" ? 404 : result.status === "recusado" ? 402 : 409;
  return Response.json(result, { status });
}
