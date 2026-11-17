import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUS_LABEL, nextOrderStatuses } from "@/lib/status";
import { diasUteis } from "@/components/Prazo";
import { IconeVoltar } from "@/components/Icones";
import { OrderStatusPill, formatDate } from "../../ui";
import { OrderStatusForm } from "../../StatusForms";

export const metadata: Metadata = { title: "Pedido" };

function formatPhone(d: string) {
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

export default async function AdminPedidoPage(props: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await props.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const options = nextOrderStatuses(order.status).map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }));

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-tinta-suave hover:text-tinta">
        <IconeVoltar className="size-4" /> Pedidos
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="titulo text-3xl font-extrabold sm:text-4xl">Pedido #{order.number}</h1>
        <OrderStatusPill status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="flex flex-col gap-6">
          <section className="bg-branco p-5 border border-tinta sm:p-6" aria-labelledby="t-status">
            <h2 id="t-status" className="mb-3 font-bold">
              Próximo passo
            </h2>
            <OrderStatusForm orderId={order.id} options={options} />
          </section>

          <section className="bg-branco p-5 border border-tinta sm:p-6" aria-labelledby="t-itens">
            <h2 id="t-itens" className="mb-3 font-bold">
              Itens
            </h2>
            <ul className="divide-y divide-tinta/10 text-sm">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-4 py-2.5">
                  <span>
                    <span className="font-semibold">
                      {it.quantity} × {it.productName}
                    </span>
                    <span className="block text-tinta-suave">
                      {it.variantName} · {formatBRL(it.unitPriceCents)} cada
                    </span>
                  </span>
                  <span className="font-semibold">{formatBRL(it.unitPriceCents * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-tinta/15 pt-3 text-sm">
              <dt>Subtotal</dt>
              <dd className="text-right">{formatBRL(order.subtotalCents)}</dd>
              <dt>{order.deliveryMethod === "entrega" ? "Entrega" : "Retirada"}</dt>
              <dd className="text-right">{order.shippingCents === 0 ? "Grátis" : formatBRL(order.shippingCents)}</dd>
              <dt className="font-bold">Total</dt>
              <dd className="text-right font-bold">{formatBRL(order.totalCents)}</dd>
            </dl>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="bg-branco p-5 text-sm border border-tinta sm:p-6" aria-labelledby="t-cliente">
            <h2 id="t-cliente" className="mb-3 font-bold">
              Cliente
            </h2>
            <p className="font-semibold">{order.customerName}</p>
            <p className="mt-1">
              <a href={`mailto:${order.email}`} className="underline">
                {order.email}
              </a>
            </p>
            <p className="mt-1">WhatsApp {formatPhone(order.whatsapp)}</p>
            <p className="mt-3 text-tinta-suave">
              {order.street}, {order.streetNumber}
              <br />
              {order.city}/{order.uf} · CEP {order.cep.slice(0, 5)}-{order.cep.slice(5)}
            </p>
          </section>
          <section className="bg-branco p-5 text-sm border border-tinta sm:p-6" aria-labelledby="t-datas">
            <h2 id="t-datas" className="mb-3 font-bold">
              Datas e prazo
            </h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              <dt className="text-tinta-suave">Criado</dt>
              <dd>{formatDate(order.createdAt)}</dd>
              <dt className="text-tinta-suave">Pago</dt>
              <dd>{order.paidAt ? formatDate(order.paidAt) : "—"}</dd>
              <dt className="text-tinta-suave">Prazo</dt>
              <dd>{diasUteis(order.leadTimeDays)}</dd>
              <dt className="text-tinta-suave">Recebimento</dt>
              <dd>{order.deliveryMethod === "entrega" ? "Entrega" : "Retirada no ateliê"}</dd>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
