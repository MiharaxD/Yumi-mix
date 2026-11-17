import { handlePaymentEvent, paymentProvider, simulationEnabled } from "@/lib/payments";

/**
 * Faz o papel do webhook do provedor na versão de teste.
 * Corpo: { orderId, outcome: "approved" | "rejected" }.
 * Desligada quando NODE_ENV === "production".
 */
export async function POST(request: Request) {
  if (!simulationEnabled()) {
    return Response.json({ error: "Simulação indisponível." }, { status: 404 });
  }

  const event = await paymentProvider.parseWebhook(request);
  if (!event) return Response.json({ error: "Requisição inválida." }, { status: 400 });

  const result = await handlePaymentEvent(event);
  const status = result.ok ? 200 : result.status === "nao_encontrado" ? 404 : result.status === "recusado" ? 402 : 409;
  return Response.json(result, { status });
}
