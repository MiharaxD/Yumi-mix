"use client";

import Link from "next/link";
import { useCartCount } from "@/lib/cart-store";
import { IconeSacola } from "@/components/Icones";

/** Célula do carrinho no cabeçalho: ícone com legenda embaixo, como na galeria. */
export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/carrinho"
      className="group flex min-w-16 flex-col items-center justify-center gap-0.5 border-l border-tinta px-4 transition-colors hover:bg-tinta hover:text-branco sm:border-r sm:px-5"
      aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho vazio"}
    >
      <IconeSacola className="size-5" />
      <span className="text-[0.625rem] font-semibold tracking-[0.06em] uppercase" aria-hidden>
        Carrinho ({count})
      </span>
    </Link>
  );
}
