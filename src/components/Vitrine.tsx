"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/money";
import { IconeSeta, IconeVoltar } from "@/components/Icones";
import { CamadasFotos, IndicadorFotos, useCicloFotos } from "@/components/FotosPeca";

export type PecaResumo = {
  slug: string;
  name: string;
  images: { url: string; alt: string }[];
  fromPriceCents: number;
  priceRange: boolean;
  readyToShip: boolean;
  productionDays: number;
  colors: string[];
};

/** Trilho de destaques com setas redondas e barra de progresso. */
export function Destaques({ pecas }: { pecas: PecaResumo[] }) {
  const trilho = useRef<HTMLUListElement>(null);
  const [progresso, setProgresso] = useState(0);
  const [limites, setLimites] = useState({ inicio: true, fim: false });

  const medir = useCallback(() => {
    const el = trilho.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgresso(max > 0 ? el.scrollLeft / max : 1);
    setLimites({ inicio: el.scrollLeft <= 2, fim: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [medir]);

  function passar(direcao: 1 | -1) {
    const el = trilho.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direcao * (card.offsetWidth + 12), behavior: reduzir ? "auto" : "smooth" });
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <ul
        ref={trilho}
        onScroll={medir}
        className="trilho flex flex-1 scroll-px-5 gap-3 overflow-x-auto px-5 pt-1 pb-5 sm:scroll-px-7 sm:px-7"
        aria-label="Peças em destaque"
      >
        {pecas.map((p) => (
          <li key={p.slug} className="w-[64%] shrink-0 sm:w-[15rem]">
            <CartaoDestaque p={p} />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 px-5 pb-5 sm:px-7 sm:pb-7">
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-nevoa" aria-hidden>
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-tinta transition-[width] duration-300"
            style={{ width: `${Math.max(14, progresso * 100)}%` }}
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => passar(-1)} disabled={limites.inicio} aria-label="Destaques anteriores" className="botao-redondo">
            <IconeVoltar className="size-[1.1rem]" />
          </button>
          <button type="button" onClick={() => passar(1)} disabled={limites.fim} aria-label="Próximos destaques" className="botao-redondo">
            <IconeSeta className="size-[1.1rem]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Cartão de um destaque: sob o mouse, as fotos da peça passam por dissolve. */
function CartaoDestaque({ p }: { p: PecaResumo }) {
  const ciclo = useCicloFotos(p.images.length);

  return (
    <Link
      href={`/produto/${p.slug}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && ciclo.entrar()}
      onPointerLeave={ciclo.sair}
      className="group flex h-full flex-col rounded-[1.5rem] bg-papel p-2 transition-colors duration-300 hover:bg-nevoa"
    >
      <span className="moldura block aspect-square lg:aspect-[4/5]">
        <span className="foto-viva absolute inset-0 block">
          <CamadasFotos
            fotos={p.images}
            sizes="(min-width: 640px) 240px, 64vw"
            atual={ciclo.atual}
            anterior={ciclo.anterior}
            montadas={ciclo.montadas}
            onCarregada={ciclo.marcarCarregada}
          />
        </span>
        <IndicadorFotos
          total={p.images.length}
          atual={ciclo.atual}
          className="absolute inset-x-5 bottom-2.5 z-[3] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </span>
      <span className="flex flex-1 flex-col gap-1 px-1.5 pt-3 pb-1">
        <span className="text-sm leading-snug font-semibold text-balance">{p.name}</span>
        <span className="mt-auto pt-1 text-sm tabular-nums">
          {p.priceRange && <span className="text-tinta-suave">a partir de </span>}
          <span className="font-bold">{formatBRL(p.fromPriceCents)}</span>
        </span>
      </span>
    </Link>
  );
}
