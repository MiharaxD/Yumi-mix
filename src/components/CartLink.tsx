"use client";

import Link from "next/link";
import { useCartCount } from "@/lib/cart-store";
import { IconeSacola } from "@/components/Icones";

/** Carrinho no cabeçalho: pílula grafite com contador que pulsa quando muda. */
export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/carrinho"
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-tinta pr-2 pl-4 text-sm font-semibold text-branco shadow-[0_8px_20px_-10px_rgb(23_24_28/0.55)] transition-colors hover:bg-[#2b2d33]"
      aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho vazio"}
    >
      <IconeSacola className="size-[1.15rem]" />
      <span className="hidden sm:inline" aria-hidden>
        Carrinho
      </span>
      <span
        key={count}
        className={`grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums ${count > 0 ? "pulsar bg-dourado text-tinta" : "bg-branco/15"}`}
        aria-hidden
      >
        {count}
      </span>
    </Link>
  );
}
