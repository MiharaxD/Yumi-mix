import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUS_LABEL, nextOrderStatuses } from "@/lib/status";
import { diasUteis } from "@/components/Prazo";
import { IconeCubo, IconeDownload, IconeVoltar } from "@/components/Icones";
import { bambuStudioLink, printFilePath } from "@/lib/print-files";
import { trackingUrl } from "@/lib/email";
import { TrackingForm } from "./TrackingForm";
import { OrderStatusPill, formatDate } from "../../ui";
import { OrderStatusForm } from "../../StatusForms";

export const metadata: Metadata = { title: "Pedido" };

function formatPhone(d: string) {
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

export default async function AdminPedidoPage(props: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await props.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { select: { productId: true } } } } },
  });
  if (!order) notFound();

  // "enviado" só pelo formulário de rastreio
  const options = nextOrderStatuses(order.status)
    .filter((s) => s !== "enviado")
    .map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }));
  const canShip = nextOrderStatuses(order.status).includes("enviado");

  // arquivo 3D de cada item (pelo produto gravado no item ou pela variante)
  const productIds = [
    ...new Set(order.items.map((it) => it.productId ?? it.variant?.productId).filter((x): x is string => Boolean(x))),
  ];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, printFileName: true, printFilePath: true },
  });
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const printLinks = new Map(
    products
      .filter((p) => p.printFilePath && p.printFileName)
      .map((p) => {
        const path = printFilePath(p.id, p.printFileName!);
        return [p.id, { download: path, bambu: bambuStudioLink(`${origin}${path}`) }] as const;
      }),
  );
  const fmtSent = order.trackingEmailSentAt ? formatDate(order.trackingEmailSentAt) : null;

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
          <section className="painel p-5 sm:p-6" aria-labelledby="t-status">
            <h2 id="t-status" className="mb-3 font-bold">
              Próximo passo
            </h2>
            <OrderStatusForm orderId={order.id} options={options} />
          </section>

          <section className="painel p-5 sm:p-6" aria-labelledby="t-envio">
            <h2 id="t-envio" className="mb-3 font-bold">
              Envio e rastreio
            </h2>
            <TrackingForm
              orderId={order.id}
              current={order.trackingCode ?? ""}
              emailSentAt={fmtSent}
              shipped={order.status === "enviado" || order.status === "entregue"}
              canShip={canShip}
              trackingHref={order.trackingCode ? trackingUrl(order.trackingCode) : null}
            />
          </section>

          <section className="painel p-5 sm:p-6" aria-labelledby="t-itens">
            <h2 id="t-itens" className="mb-1 font-bold">
              Itens para imprimir
            </h2>
            <p className="mb-3 text-sm text-tinta-suave">
              &quot;Abrir no Bambu Studio&quot; baixa o .3mf direto no programa. Se o navegador perguntar, permita abrir o
              Bambu Studio.
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              {order.items.map((it) => {
                const pid = it.productId ?? it.variant?.productId ?? "";
                const link = printLinks.get(pid);
                return (
                  <li key={it.id} className="rounded-foto bg-papel p-4">
                    <div className="flex justify-between gap-4">
                      <span>
                        <span className="font-semibold">
                          {it.quantity} × {it.productName}
                        </span>
                        <span className="block text-tinta-suave">
                          {it.variantName} · {formatBRL(it.unitPriceCents)} cada
                        </span>
                      </span>
                      <span className="font-semibold">{formatBRL(it.unitPriceCents * it.quantity)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {link ? (
                        <>
                          <a href={link.bambu} className="botao-principal px-4 py-2.5 text-sm">
                            <IconeCubo className="size-4" /> Abrir no Bambu Studio
                          </a>
                          <a href={link.download} className="botao-contorno px-4 py-2.5 text-sm">
                            <IconeDownload className="size-4" /> Baixar .3mf
                          </a>
                        </>
                      ) : (
                        <span className="text-tinta-suave">
                          Sem arquivo 3D.{" "}
                          {pid && (
                            <Link href={`/admin/produtos/${pid}`} className="font-semibold text-tinta underline">
                              Adicionar no produto
                            </Link>
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-linha pt-3 text-sm">
              <dt>Subtotal</dt>
              <dd className="text-right">{formatBRL(order.subtotalCents)}</dd>
              <dt>Frete cobrado{order.shippingServiceName ? ` (${order.shippingServiceName})` : ""}</dt>
              <dd className="text-right">{order.shippingCents === 0 ? "Grátis" : formatBRL(order.shippingCents)}</dd>
              {order.shippingRealCents !== null && (
                <>
                  <dt className="text-tinta-suave">Frete real cotado</dt>
                  <dd className="text-right text-tinta-suave">{formatBRL(order.shippingRealCents)}</dd>
                </>
              )}
              <dt className="font-bold">Total</dt>
              <dd className="text-right font-bold">{formatBRL(order.totalCents)}</dd>
            </dl>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="painel p-5 text-sm sm:p-6" aria-labelledby="t-cliente">
            <h2 id="t-cliente" className="mb-3 font-bold">
              Cliente
            </h2>
            <p className="font-semibold">{order.customerName}</p>
            <p className="mt-1">
              <a href={`mailto:${order.email}`} className="underline">
                {order.email}
              </a>
            </p>
            <p className="mt-1">Telefone {formatPhone(order.whatsapp)}</p>
            <p className="mt-3 text-tinta-suave">
              {order.street}, {order.streetNumber}
              {order.complement && ` · ${order.complement}`}
              <br />
              {order.neighborhood && (
                <>
                  {order.neighborhood}
                  <br />
                </>
              )}
              {order.city}/{order.uf} · CEP {order.cep.slice(0, 5)}-{order.cep.slice(5)}
            </p>
          </section>
          <section className="painel p-5 text-sm sm:p-6" aria-labelledby="t-datas">
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
              <dd>
                {order.deliveryMethod === "retirada"
                  ? "Retirada no ateliê"
                  : `${order.shippingServiceName ?? "Entrega"}${order.shippingDays ? ` · ${diasUteis(order.shippingDays)}` : ""}`}
              </dd>
              <dt className="text-tinta-suave">Enviado</dt>
              <dd>{order.shippedAt ? formatDate(order.shippedAt) : "—"}</dd>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
