import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { CUSTOM_STATUSES, CUSTOM_STATUS_LABEL, isCustomStatus, nextCustomStatuses } from "@/lib/status";
import { CustomStatusPill, PageTitle, formatDate } from "../ui";
import { CustomStatusForm, QuoteForm } from "../StatusForms";

export const metadata: Metadata = { title: "Sob medida" };

function centsToInput(cents: number | null) {
  return cents === null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

export default async function AdminPersonalizadosPage(props: PageProps<"/admin/personalizados">) {
  const sp = await props.searchParams;
  const raw = typeof sp.status === "string" ? sp.status : "";
  const filter = isCustomStatus(raw) ? raw : null;

  const [requests, counts] = await Promise.all([
    prisma.customRequest.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      include: { images: true },
      take: 100,
    }),
    prisma.customRequest.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countBy = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((n, c) => n + c._count._all, 0);
  const tabs = [{ value: null, label: "Todas", count: total }, ...CUSTOM_STATUSES.map((s) => ({ value: s, label: CUSTOM_STATUS_LABEL[s], count: countBy[s] ?? 0 }))];

  return (
    <>
      <PageTitle>Pedidos sob medida</PageTitle>

      <nav aria-label="Filtrar por status" className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const active = t.value === filter;
          return (
            <Link
              key={t.label}
              href={t.value ? `/admin/personalizados?status=${t.value}` : "/admin/personalizados"}
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

      {requests.length === 0 ? (
        <p className="bg-branco px-5 py-8 text-center text-tinta-suave">
          Nenhuma solicitação {filter ? `com status "${CUSTOM_STATUS_LABEL[filter]}"` : "ainda"}.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {requests.map((r) => {
            const options = nextCustomStatuses(r.status).map((s) => ({ value: s, label: CUSTOM_STATUS_LABEL[s] }));
            const locked = r.status !== "nova" && r.status !== "orcada";
            return (
              <li key={r.id} id={`s-${r.id}`} className="painel p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-lg font-bold">Solicitação nº {r.number}</h2>
                  <CustomStatusPill status={r.status} />
                  <span className="text-sm text-tinta-suave">{formatDate(r.createdAt)}</span>
                  {r.quotedPriceCents !== null && (
                    <span className="ml-auto text-sm font-semibold">Orçado: {formatBRL(r.quotedPriceCents)}</span>
                  )}
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_18rem]">
                  <div>
                    <p className="max-w-prose whitespace-pre-line">{r.description}</p>
                    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
                      <dt className="text-tinta-suave">Medidas</dt>
                      <dd>{r.dimensions}</dd>
                      <dt className="text-tinta-suave">Material/cor</dt>
                      <dd>{r.materialColor}</dd>
                      <dt className="text-tinta-suave">Quantidade</dt>
                      <dd>{r.quantity}</dd>
                      <dt className="text-tinta-suave">Prazo desejado</dt>
                      <dd>{r.desiredDate}</dd>
                      <dt className="text-tinta-suave">Cliente</dt>
                      <dd>
                        {r.name} · {r.contact}
                      </dd>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {r.images.map((img, i) => (
                        <a
                          key={img.id}
                          href={`/api/admin/uploads/${img.id}`}
                          target="_blank"
                          rel="noopener"
                          className="block overflow-hidden ring-1 ring-tinta/15 hover:ring-tinta"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- imagem privada servida pela rota do admin */}
                          <img
                            src={`/api/admin/uploads/${img.id}`}
                            alt={`Referência ${i + 1} da solicitação ${r.number}`}
                            className="size-28 object-cover sm:size-32"
                          />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 border-t border-linha pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                    <QuoteForm requestId={r.id} current={centsToInput(r.quotedPriceCents)} locked={locked} />
                    <div>
                      <p className="mb-2 text-sm font-semibold">Status</p>
                      <CustomStatusForm requestId={r.id} options={options} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
