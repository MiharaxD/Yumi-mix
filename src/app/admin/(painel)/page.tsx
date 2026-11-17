import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/status";
import { OrderStatusPill, PageTitle, formatDate } from "./ui";

export const metadata: Metadata = { title: "Pedidos" };

export default async function AdminPedidosPage(props: PageProps<"/admin">) {
  const sp = await props.searchParams;
  const raw = typeof sp.status === "string" ? sp.status : "";
  const filter = isOrderStatus(raw) ? raw : null;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
      take: 200,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countBy = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((n, c) => n + c._count._all, 0);

  const tabs = [{ value: null, label: "Todos", count: total }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s], count: countBy[s] ?? 0 }))];

  return (
    <>
      <PageTitle>Pedidos</PageTitle>

      <nav aria-label="Filtrar por status" className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const active = t.value === filter;
          return (
            <Link
              key={t.label}
              href={t.value ? `/admin?status=${t.value}` : "/admin"}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                active ? "bg-tinta text-branco" : "bg-branco text-tinta hover:bg-white"
              }`}
            >
              {t.label}
              <span className={active ? "text-nevoa" : "text-tinta-suave"}>{t.count}</span>
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <p className="bg-branco px-5 py-8 text-center text-tinta-suave">
          {filter ? `Nenhum pedido com status "${ORDER_STATUS_LABEL[filter]}".` : "Nenhum pedido ainda. Faça uma compra de teste pela loja."}
        </p>
      ) : (
        <div className="overflow-hidden bg-branco border border-tinta">
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-papel text-xs tracking-wide text-tinta-suave uppercase sm:table-header-group">
              <tr>
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">Entrega</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tinta/10">
              {orders.map((o) => (
                <tr key={o.id} className="relative grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-4 hover:bg-white sm:table-row sm:p-0">
                  <td className="col-start-1 row-start-1 font-bold sm:px-5 sm:py-3.5">
                    <Link href={`/admin/pedidos/${o.id}`} className="after:absolute after:inset-0 hover:underline">
                      #{o.number}
                    </Link>
                  </td>
                  <td className="col-span-2 row-start-2 sm:px-5 sm:py-3.5">
                    {o.customerName}
                    <span className="block text-xs text-tinta-suave">{o._count.items} {o._count.items === 1 ? "item" : "itens"}</span>
                  </td>
                  <td className="col-span-2 text-tinta-suave sm:px-5 sm:py-3.5">{formatDate(o.createdAt)}</td>
                  <td className="hidden sm:table-cell sm:px-5 sm:py-3.5">{o.deliveryMethod === "entrega" ? "Entrega" : "Retirada"}</td>
                  <td className="col-start-2 row-start-1 text-right font-semibold sm:px-5 sm:py-3.5">{formatBRL(o.totalCents)}</td>
                  <td className="col-span-2 sm:px-5 sm:py-3.5">
                    <OrderStatusPill status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
