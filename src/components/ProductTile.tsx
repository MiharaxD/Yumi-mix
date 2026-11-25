"use client";

import Link from "next/link";
import { formatBRL } from "@/lib/money";
import { SeloPrazo } from "@/components/Prazo";
import {
  CamadasFotos,
  IndicadorFotos,
  useCicloFotos,
} from "@/components/FotosPeca";
import { BotaoLoja, lojasDaPeca } from "@/components/BotaoLoja";

type Props = {
  slug: string;
  name: string;
  images: { url: string; alt: string }[];
  fromPriceCents: number;
  priceRange: boolean;
  readyToShip: boolean;
  productionDays: number;
  colors: string[];
  shopeeUrl?: string | null;
  mercadoLivreUrl?: string | null;
  priority?: boolean;
};

/** Cartão de peça: foto grande arredondada, nome e preço embaixo. Sob o mouse, sobe e as fotos passam por dissolve. */
export function ProductTile(p: Props) {
  const ciclo = useCicloFotos(p.images.length);
  const lojas = lojasDaPeca(p.shopeeUrl, p.mercadoLivreUrl);

  // o link da peça cobre foto e texto; os botões das lojas ficam fora dele (link dentro de link não vale)
  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && ciclo.entrar()}
      onPointerLeave={ciclo.sair}
      className="cartao group flex h-full flex-col p-2 sm:p-2.5"
    >
      <Link
        href={`/produto/${p.slug}`}
        className="flex flex-1 flex-col rounded-[1.25rem]"
      >
        <div className="moldura aspect-square w-full bg-papel">
          <span className="foto-viva absolute inset-0 block mix-blend-multiply">
            <CamadasFotos
              fotos={p.images}
              sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, 47vw"
              atual={ciclo.atual}
              anterior={ciclo.anterior}
              montadas={ciclo.montadas}
              priority={p.priority}
              onCarregada={ciclo.marcarCarregada}
            />
          </span>
          <SeloPrazo
            readyToShip={p.readyToShip}
            productionDays={p.productionDays}
            compact
            className="absolute top-2 right-2 z-[3] whitespace-nowrap sm:top-3 sm:right-3"
          />
          <IndicadorFotos
            total={p.images.length}
            atual={ciclo.atual}
            className="absolute inset-x-6 bottom-3 z-[3] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-coarse:hidden"
          />
        </div>
        <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1.5 sm:px-2.5 sm:pt-4 sm:pb-2.5">
          <h3 className="text-[0.9375rem] leading-snug font-semibold text-balance sm:text-base">
            {p.name}
          </h3>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2.5">
            <p className="leading-tight tabular-nums">
              {p.priceRange && (
                <span className="block text-xs text-tinta-suave">
                  a partir de
                </span>
              )}
              <span className="text-base font-bold sm:text-lg">
                {formatBRL(p.fromPriceCents)}
              </span>
            </p>
            {p.colors.length > 1 && (
              <span
                className="flex -space-x-1 pb-1"
                aria-label={`${p.colors.length} cores`}
              >
                {p.colors.map((c) => (
                  <span
                    key={c}
                    className="size-3.5 rounded-full ring-2 ring-branco"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
            )}
          </div>
        </div>
      </Link>
      {lojas.length > 0 && (
        <div
          className={`grid gap-1.5 px-1 pb-1 sm:gap-2 sm:px-2 sm:pb-2 ${lojas.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {lojas.map((l) => (
            <BotaoLoja key={l.chave} loja={l} compacto />
          ))}
        </div>
      )}
    </div>
  );
}
