import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { paymentProvider, simulationEnabled } from "@/lib/payments";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/status";
import { diasUteis } from "@/components/Prazo";
import { IconeCheck, IconeSeta } from "@/components/Icones";
import { PaymentTabs } from "./PaymentTabs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };

export default async function PagamentoPage(props: PageProps<"/pedido/[id]/pagamento">) {
  const { id } = await props.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const statusLabel = isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status;
  const pending = order.status === "pendente";
  const pix = pending ? await paymentProvider.createPixCharge(order) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
      <h1 className="titulo mb-8 text-[2.75rem] leading-[0.95] sm:mb-10 sm:text-[4rem]">
        {pending
          ? `Pagamento do pedido #${order.number}`
          : order.status === "cancelado"
            ? `Pedido #${order.number} cancelado`
            : `Pedido #${order.number} pago`}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        {pending && pix ? (
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
          <div className="painel p-6 sm:p-8">
            <p className="text-lg font-semibold">Este pedido foi cancelado e não aceita pagamento.</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 font-semibold underline">
              Voltar para a vitrine <IconeSeta className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="painel p-6 sm:p-8">
              <span className="grid size-14 place-items-center bg-tinta text-branco">
                <IconeCheck className="size-8" />
              </span>
              <p className="titulo mt-5 text-[2rem] leading-none">Recebemos seu pagamento.</p>
              <p className="mt-2 max-w-prose text-tinta-suave">
                O pedido #{order.number} já está na fila do ateliê. Em até {diasUteis(order.leadTimeDays)} fica tudo
                pronto e chamamos você no WhatsApp para combinar{" "}
                {order.deliveryMethod === "retirada" ? "a retirada" : "a entrega"}.
              </p>
              <p className="mt-4 inline-flex bg-tinta px-3 py-1 text-sm font-semibold text-branco">
                Status: {statusLabel}
              </p>
              <div className="mt-6">
                <Link href="/" className="inline-flex items-center gap-2 font-semibold underline">
                  Voltar para a vitrine <IconeSeta className="size-4" />
                </Link>
              </div>
          </div>
        )}

        <aside className="bg-branco p-5 border border-tinta sm:p-6" aria-label="Resumo do pedido">
          <h2 className="text-lg font-bold">Resumo</h2>
          <ul className="mt-3 flex flex-col gap-2 border-b border-tinta/15 pb-4 text-sm">
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
            <dt>{order.deliveryMethod === "entrega" ? "Entrega" : "Retirada"}</dt>
            <dd className="text-right">{order.shippingCents === 0 ? "Grátis" : formatBRL(order.shippingCents)}</dd>
            <dt className="border-t border-tinta/15 pt-3 text-base font-bold">Total</dt>
            <dd className="border-t border-tinta/15 pt-3 titulo text-right text-[1.75rem] leading-none">{formatBRL(order.totalCents)}</dd>
          </dl>
          <p className="mt-4 text-sm text-tinta-suave">
            {order.customerName} · {order.email}
          </p>
        </aside>
      </div>
    </div>
  );
}
