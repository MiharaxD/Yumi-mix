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
        className={`inline-flex items-center gap-1.5 rounded-full bg-branco/95 px-2.5 py-1 text-[0.6875rem] font-semibold text-tinta shadow-[0_2px_8px_-2px_rgb(23_24_28/0.18)] sm:text-xs ${className}`}
      >
        <span className="size-1.5 rounded-full bg-[#2f9e5b]" aria-hidden />
        Pronta entrega
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-branco/95 px-2.5 py-1 text-[0.6875rem] font-semibold text-tinta shadow-[0_2px_8px_-2px_rgb(23_24_28/0.18)] sm:text-xs ${className}`}
      title={`Produzida depois do pedido; envio em até ${diasUteis(productionDays)}.`}
    >
      <IconeRelogio className="size-3.5" />
      {compact ? diasUteis(productionDays) : `Feita em ${diasUteis(productionDays)}`}
    </span>
  );
}

export { READY_TO_SHIP_DAYS };
