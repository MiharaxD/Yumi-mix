import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { handlePaymentEvent, paymentProvider, simulationEnabled } from "@/lib/payments";
import { FakeProvider } from "@/lib/payments/fake-provider";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/status";
import { diasUteis } from "@/components/Prazo";
import { IconeCheck, IconeSeta } from "@/components/Icones";
import { trackingUrl } from "@/lib/email";
import { PaymentTabs } from "./PaymentTabs";
import { MercadoPagoPay, type ReturnNotice } from "./MercadoPagoPay";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };

export default async function PagamentoPage(props: PageProps<"/pedido/[id]/pagamento">) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  // volta do Mercado Pago: confirma o pagamento direto na API (não confia na URL)
  let notice: ReturnNotice = null;
  const returnedPaymentId = first(query.payment_id) ?? first(query.collection_id);
  if (returnedPaymentId && returnedPaymentId !== "null" && !paymentProvider.isSimulated) {
    try {
      const event = await paymentProvider.getPaymentEvent(returnedPaymentId);
      if (event && event.orderId === id) {
        const r = await handlePaymentEvent(event);
        if (!r.ok) notice = r.status === "recusado" ? "recusado" : "erro";
      } else if (!event) {
        notice = "em_analise";
      }
    } catch (e) {
      console.error("[mercadopago] falha ao consultar pagamento na volta:", e instanceof Error ? e.message : e);
      notice = "em_analise";
    }
  } else {
    const mp = first(query.mp);
    if (mp === "falhou") notice = "recusado";
    else if (mp === "erro") notice = "erro";
  }

  // rede de segurança: pedido ainda pendente? procura um pagamento aprovado dele no MP
  if (!paymentProvider.isSimulated) {
    const current = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (current?.status === "pendente") {
      try {
        const approved = await paymentProvider.findApprovedPayment(id);
        if (approved) {
          const r = await handlePaymentEvent(approved);
          if (r.ok) notice = null;
        }
      } catch (e) {
        console.error("[mercadopago] falha ao buscar pagamentos do pedido:", e instanceof Error ? e.message : e);
      }
    }
  }

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const statusLabel = isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status;
  const pending = order.status === "pendente";
  const pix = pending && paymentProvider instanceof FakeProvider ? await paymentProvider.createPixCharge(order) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
      <h1 className="titulo mb-8 text-[2.25rem] leading-[1.02] sm:mb-10 sm:text-[3.25rem]">
        {pending
          ? `Pagamento do pedido #${order.number}`
          : order.status === "cancelado"
            ? `Pedido #${order.number} cancelado`
            : `Pedido #${order.number} pago`}
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        {pending && !paymentProvider.isSimulated ? (
          <MercadoPagoPay orderId={order.id} notice={notice} />
        ) : pending && pix ? (
          <PaymentTabs
            orderId={order.id}
            simulation={simulationEnabled()}
            pix={{
              copyPaste: pix.copyPaste,
              qrImageSrc: pix.qrImageSrc,
              expiresAtLabel: pix.expiresAt.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo",
              }),
            }}
          />
        ) : order.status === "cancelado" ? (
          <div className="painel p-7 sm:p-9">
            <p className="text-lg font-semibold">Este pedido foi cancelado e não aceita pagamento.</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 font-semibold underline">
              Voltar para a vitrine <IconeSeta className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="painel p-7 sm:p-9">
              <span className="grid size-14 place-items-center rounded-full bg-tinta text-branco">
                <IconeCheck className="check-desenha size-7" />
              </span>
              <p className="titulo mt-5 text-[1.75rem] leading-tight">Recebemos seu pagamento.</p>
              <p className="mt-2 max-w-prose text-tinta-suave">
                O pedido #{order.number} já está com a gente. Em até {diasUteis(order.leadTimeDays)} fica tudo
                pronto e enviamos. O código de rastreio chega no seu email.
              </p>
              <p className="mt-4 inline-flex rounded-full bg-dourado-claro px-3.5 py-1.5 text-sm font-semibold">
                Status: {statusLabel}
              </p>
              {order.trackingCode && (
                <p className="mt-4 text-sm">
                  Rastreio <span className="font-semibold">{order.trackingCode}</span> ·{" "}
                  <a href={trackingUrl(order.trackingCode)} target="_blank" rel="noreferrer" className="font-semibold underline">
                    Acompanhar entrega
                  </a>
                </p>
              )}
              <div className="mt-6">
                <Link href="/" className="inline-flex items-center gap-2 font-semibold underline">
                  Voltar para a vitrine <IconeSeta className="size-4" />
                </Link>
              </div>
          </div>
        )}

        <aside className="painel p-5 sm:p-7" aria-label="Resumo do pedido">
          <h2 className="text-lg font-bold">Resumo</h2>
          <ul className="mt-3 flex flex-col gap-2.5 pb-2 text-sm">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span>
                  {it.quantity} × {it.productName}
                  <span className="block text-tinta-suave">{it.variantName}</span>
                </span>
                <span className="font-semibold">{formatBRL(it.unitPriceCents * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
            <dt>Subtotal</dt>
            <dd className="text-right">{formatBRL(order.subtotalCents)}</dd>
            <dt>Frete{order.shippingServiceName ? ` (${order.shippingServiceName})` : ""}</dt>
            <dd className="text-right">{order.shippingCents === 0 ? "Grátis" : formatBRL(order.shippingCents)}</dd>
            <div className="col-span-2 mt-2 flex items-center justify-between gap-4 rounded-2xl bg-papel px-4 py-3.5">
              <dt className="text-base font-bold">Total</dt>
              <dd className="titulo text-[1.75rem] leading-none">{formatBRL(order.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-tinta-suave">
            {order.customerName} · {order.email}
          </p>
        </aside>
      </div>
    </div>
  );
}
