import { IconeRelogio } from "@/components/Icones";
import { READY_TO_SHIP_DAYS } from "@/config";

export function diasUteis(n: number) {
  return `${n} ${n === 1 ? "dia útil" : "dias úteis"}`;
}

/** Selo de disponibilidade: pronta entrega ou prazo de produção. */
export function SeloPrazo({
  readyToShip,
  productionDays,
  className = "",
  compact = false,
}: {
  readyToShip: boolean;
  productionDays: number;
  className?: string;
  compact?: boolean;
}) {
  if (readyToShip) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-tinta px-2 py-1 text-[0.6875rem] font-semibold tracking-[0.06em] text-branco uppercase ${className}`}
      >
        <span className="size-1.5 rounded-full bg-branco" aria-hidden />
        Pronta entrega
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-tinta/40 px-2 py-1 text-[0.6875rem] font-semibold tracking-[0.06em] text-tinta uppercase ${className}`}
      title={`Produzida depois do pedido; envio em até ${diasUteis(productionDays)}.`}
    >
      <IconeRelogio className="size-3.5" />
      {compact ? diasUteis(productionDays) : `Feita em ${diasUteis(productionDays)}`}
    </span>
  );
}

export { READY_TO_SHIP_DAYS };
