import Link from "next/link";
import { ImagemPeca } from "@/components/ImagemPeca";
import { formatBRL } from "@/lib/money";
import { SeloPrazo } from "@/components/Prazo";

type Props = {
  slug: string;
  name: string;
  imageUrl: string | null;
  imageAlt: string;
  fromPriceCents: number;
  priceRange: boolean;
  readyToShip: boolean;
  productionDays: number;
  colors: string[];
  priority?: boolean;
};

/** Célula da grade da galeria: a peça em moldura branca, ficha técnica embaixo. */
export function ProductTile(p: Props) {
  return (
    <Link href={`/produto/${p.slug}`} className="group flex h-full flex-col bg-papel p-3 transition-colors hover:bg-branco sm:p-5">
      <div className="moldura aspect-[4/5] w-full lg:aspect-[6/5]">
        {p.imageUrl && (
          <ImagemPeca
            src={p.imageUrl}
            alt={p.imageAlt}
            sizes="(min-width: 1024px) 30vw, 48vw"
            className="foto-viva"
            priority={p.priority}
          />
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col sm:mt-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3 className="text-[0.9375rem] leading-tight font-bold text-balance sm:text-base">{p.name}</h3>
          <p className="text-sm whitespace-nowrap sm:text-right">
            {p.priceRange && <span className="text-tinta-suave">a partir de </span>}
            <span className="font-semibold">{formatBRL(p.fromPriceCents)}</span>
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <SeloPrazo readyToShip={p.readyToShip} productionDays={p.productionDays} compact className="whitespace-nowrap" />
          <span className="flex gap-1" aria-label={`${p.colors.length} ${p.colors.length === 1 ? "cor" : "cores"}`}>
            {p.colors.map((c) => (
              <span key={c} className="size-3 rounded-full ring-1 ring-tinta/20" style={{ backgroundColor: c }} />
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
}
