import { appUrl, loadOrderForPayment, paymentProvider } from "@/lib/payments";

/**
 * Botão "Pagar com Mercado Pago": cria a preferência a partir do pedido
 * (valores do banco, nunca do navegador) e redireciona para o checkout do MP.
 * Recebe um form com `orderId`.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const orderId = String(form?.get("orderId") ?? "");
  const origin = appUrl() ?? new URL(request.url).origin;
  const back = (query: string) => Response.redirect(`${origin}/pedido/${encodeURIComponent(orderId)}/pagamento?${query}`, 303);

  if (paymentProvider.isSimulated || !/^[a-z0-9]{10,40}$/i.test(orderId)) {
    return Response.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const order = await loadOrderForPayment(orderId);
  if (!order) return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.status !== "pendente") return back("mp=fechado");

  try {
    const { url } = await paymentProvider.createCheckout(order, origin);
    return Response.redirect(url, 303);
  } catch (e) {
    console.error("[mercadopago] erro ao criar preferência:", e instanceof Error ? e.message : e);
    return back("mp=erro");
  }
}
