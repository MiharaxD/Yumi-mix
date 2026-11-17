import { formatBRL } from "@/lib/money";
import { diasUteis } from "@/components/Prazo";

/** Bloco de totais reaproveitado no carrinho e no checkout. */
export function CartTotals({
  subtotalCents,
  shippingCents,
  totalCents,
  leadTimeDays,
  shippingLabel,
  muted = false,
}: {
  subtotalCents: number;
  shippingCents: number | null;
  totalCents: number;
  leadTimeDays: number;
  shippingLabel: string;
  muted?: boolean;
}) {
  return (
    <dl className={`grid grid-cols-[1fr_auto] gap-y-2.5 text-sm transition-opacity ${muted ? "opacity-60" : ""}`}>
      <dt>Subtotal</dt>
      <dd className="text-right font-semibold">{formatBRL(subtotalCents)}</dd>
      <dt>{shippingLabel}</dt>
      <dd className="text-right font-semibold">
        {shippingCents === null ? "—" : shippingCents === 0 ? "Grátis" : formatBRL(shippingCents)}
      </dd>
      <dt className="border-t border-tinta pt-3 text-base font-bold">Total</dt>
      <dd className="border-t border-tinta pt-3 titulo text-right text-[1.75rem] leading-none">{formatBRL(totalCents)}</dd>
      <dt className="col-span-2 mt-1 text-tinta-suave">
        Fica tudo pronto em até <strong className="text-tinta">{diasUteis(leadTimeDays)}</strong>; enviamos as peças
        juntas.
      </dt>
    </dl>
  );
}
