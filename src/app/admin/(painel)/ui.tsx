import { CUSTOM_STATUS_LABEL, ORDER_STATUS_LABEL, isCustomStatus, isOrderStatus } from "@/lib/status";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export function formatDate(d: Date): string {
  return dateFmt.format(d);
}

const ORDER_TONE: Record<string, string> = {
  pendente: "bg-cinza text-tinta",
  pago: "bg-nevoa text-tinta",
  em_producao: "bg-tinta-suave text-branco",
  enviado: "bg-tinta text-branco",
  entregue: "border border-tinta/40 text-tinta",
  cancelado: "bg-erro-fundo text-erro",
};

const CUSTOM_TONE: Record<string, string> = {
  nova: "bg-nevoa text-tinta",
  orcada: "bg-tinta-suave text-branco",
  aprovada: "bg-tinta text-branco",
  recusada: "bg-erro-fundo text-erro",
};

export function OrderStatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${ORDER_TONE[status] ?? "bg-papel"}`}>
      {isOrderStatus(status) ? ORDER_STATUS_LABEL[status] : status}
    </span>
  );
}

export function CustomStatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${CUSTOM_TONE[status] ?? "bg-papel"}`}>
      {isCustomStatus(status) ? CUSTOM_STATUS_LABEL[status] : status}
    </span>
  );
}

export function PageTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h1 className="titulo text-3xl font-extrabold sm:text-4xl">{children}</h1>
      {aside}
    </div>
  );
}
