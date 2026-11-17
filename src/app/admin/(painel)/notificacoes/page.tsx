import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageTitle, formatDate } from "../ui";

export const metadata: Metadata = { title: "Avisos" };

export default async function AdminNotificacoesPage() {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <>
      <PageTitle>Avisos</PageTitle>
      {notifications.length === 0 ? (
        <p className="bg-branco px-5 py-8 text-center text-tinta-suave">
          Nenhum aviso. Quando um pedido for pago, ele aparece aqui.
        </p>
      ) : (
        <ul className="divide-y divide-tinta/10 overflow-hidden bg-branco border border-tinta">
          {notifications.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4">
              <span className="flex items-center gap-3">
                <span className="size-2.5 shrink-0 rounded-full bg-tinta-suave" aria-hidden />
                {n.orderId ? (
                  <Link href={`/admin/pedidos/${n.orderId}`} className="font-semibold hover:underline">
                    {n.message}
                  </Link>
                ) : (
                  <span className="font-semibold">{n.message}</span>
                )}
              </span>
              <time dateTime={n.createdAt.toISOString()} className="text-sm text-tinta-suave">
                {formatDate(n.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
