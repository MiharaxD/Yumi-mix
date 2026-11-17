"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/money";
import { ImagemPeca } from "@/components/ImagemPeca";
import { SeloPrazo } from "@/components/Prazo";
import { IconeSeta, IconeVoltar } from "@/components/Icones";

export type PecaResumo = {
  slug: string;
  name: string;
  imageUrl: string | null;
  imageAlt: string;
  fromPriceCents: number;
  priceRange: boolean;
  readyToShip: boolean;
  productionDays: number;
  colors: string[];
};

function Preco({ p, className = "" }: { p: PecaResumo; className?: string }) {
  return (
    <span className={className}>
      {p.priceRange && <span className="font-normal text-tinta-suave">a partir de </span>}
      {formatBRL(p.fromPriceCents)}
    </span>
  );
}

/** Trilho de destaques com setas em células e linha de progresso (hero da vitrine). */
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
    el.scrollBy({ left: direcao * (card.offsetWidth + 16), behavior: reduzir ? "auto" : "smooth" });
  }

  return (
    <div className="flex h-full flex-col">
      <ul
        ref={trilho}
        onScroll={medir}
        className="trilho flex flex-1 scroll-px-5 gap-4 overflow-x-auto px-5 pb-6 sm:scroll-px-8 sm:px-8"
        aria-label="Peças em destaque"
      >
        {pecas.map((p) => (
          <li key={p.slug} className="w-[62%] shrink-0 sm:w-[15.5rem]">
            <Link href={`/produto/${p.slug}`} className="group flex h-full flex-col border border-tinta/25 bg-branco transition-colors hover:border-tinta">
              <span className="moldura block aspect-[4/5]">
                {p.imageUrl && (
                  <ImagemPeca src={p.imageUrl} alt={p.imageAlt} sizes="(min-width: 640px) 248px, 62vw" className="foto-viva" />
                )}
              </span>
              <span className="flex flex-1 flex-col gap-1 border-t border-tinta/15 px-3.5 py-3">
                <span className="text-[0.625rem] font-semibold tracking-[0.08em] text-tinta-suave uppercase">
                  {p.readyToShip ? "Pronta entrega" : `Sob encomenda`}
                </span>
                <span className="flex items-end justify-between gap-3">
                  <span className="text-sm leading-tight font-bold text-balance">{p.name}</span>
                  <Preco p={p} className="shrink-0 text-xs font-semibold" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-stretch border-t border-tinta">
        <button
          type="button"
          onClick={() => passar(-1)}
          disabled={limites.inicio}
          aria-label="Destaques anteriores"
          className="grid size-14 place-items-center border-r border-tinta transition-colors hover:bg-tinta hover:text-branco disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-tinta"
        >
          <IconeVoltar />
        </button>
        <div className="flex flex-1 items-center px-6" aria-hidden>
          <div className="relative h-px w-full bg-tinta/20">
            <div
              className="absolute inset-y-0 left-0 -mt-px h-[3px] bg-tinta transition-[width] duration-300"
              style={{ width: `${Math.max(12, progresso * 100)}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => passar(1)}
          disabled={limites.fim}
          aria-label="Próximos destaques"
          className="grid size-14 place-items-center border-l border-tinta transition-colors hover:bg-tinta hover:text-branco disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-tinta"
        >
          <IconeSeta />
        </button>
      </div>
    </div>
  );
}

/** Lista de peças em linhas; a linha ativa fica preta e mostra a peça ao lado. */
export function ListaPecas({ pecas }: { pecas: PecaResumo[] }) {
  const [ativa, setAtiva] = useState(0);
  const atual = pecas[ativa] ?? pecas[0];
  if (!atual) return null;

  return (
    <div className="grid border-y border-tinta lg:grid-cols-[1.15fr_1fr]">
      <ol className="lg:border-r lg:border-tinta">
        {pecas.map((p, i) => (
          <li key={p.slug} className="border-b border-tinta last:border-b-0">
            <Link
              href={`/produto/${p.slug}`}
              data-ativa={i === ativa}
              onMouseEnter={() => setAtiva(i)}
              onFocus={() => setAtiva(i)}
              className="linha-lista flex items-center gap-4 px-4 py-5 sm:px-6 sm:py-6"
            >
              <span className="seta hidden sm:block" aria-hidden>
                <IconeSeta className="size-6" />
              </span>
              <span className="titulo flex-1 text-2xl leading-none sm:text-[2rem]">{p.name}</span>
              <Preco p={p} className="text-sm font-semibold [&>span]:text-current [&>span]:opacity-70" />
            </Link>
          </li>
        ))}
      </ol>

      <div className="hidden flex-col items-center justify-center gap-6 bg-branco px-10 py-12 lg:flex">
        <div key={atual.slug} className="surgir w-full max-w-[19rem] border border-tinta/25">
          <div className="moldura aspect-[4/5]">
            {atual.imageUrl && <ImagemPeca src={atual.imageUrl} alt="" sizes="304px" />}
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-tinta/15 px-4 py-3">
            <span>
              <span className="block text-[0.625rem] font-semibold tracking-[0.08em] text-tinta-suave uppercase">
                {atual.colors.length} {atual.colors.length === 1 ? "cor" : "cores"}
              </span>
              <span className="text-sm font-bold">{atual.name}</span>
            </span>
            <Preco p={atual} className="text-sm font-semibold" />
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/produto/${atual.slug}`} className="botao-principal px-5 py-3">
            Ver a peça <IconeSeta className="size-4" />
          </Link>
          <SeloPrazo readyToShip={atual.readyToShip} productionDays={atual.productionDays} compact className="self-center" />
        </div>
      </div>
    </div>
  );
}
