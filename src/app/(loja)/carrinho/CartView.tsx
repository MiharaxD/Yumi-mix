"use client";

import { ImagemPeca } from "@/components/ImagemPeca";
import Link from "next/link";
import { useEffect } from "react";
import { removeFromCart, removeManyFromCart, setCartQuantity, useCart, useHydrated } from "@/lib/cart-store";
import { useQuote } from "@/lib/use-quote";
import { formatBRL } from "@/lib/money";
import { missingForFreeShipping } from "@/lib/pricing";
import { FREE_SHIPPING_THRESHOLD_CENTS, MAX_QUANTITY_PER_ITEM, SHIPPING_FEE_CENTS } from "@/config";
import { QuantityStepper } from "@/components/QuantityStepper";
import { CartTotals } from "@/components/CartSummary";
import { SeloPrazo } from "@/components/Prazo";
import { IconeLixeira, IconeSeta } from "@/components/Icones";

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart();
  const { quote, loading, error } = useQuote(items, "entrega");

  // peça que saiu do catálogo some do carrinho
  useEffect(() => {
    if (quote && quote.unavailable.length > 0) removeManyFromCart(quote.unavailable);
  }, [quote]);

  if (!hydrated || (items.length > 0 && !quote && !error)) {
    return (
      <div className="h-64 animate-pulse rounded-cartao bg-nevoa" aria-busy="true" aria-label="Carregando carrinho" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="painel max-w-lg p-7 sm:p-9">
          <h2 className="titulo text-[1.75rem] leading-tight">Seu carrinho está vazio</h2>
          <p className="mt-2 text-tinta-suave">Escolha uma peça na vitrine e ela aparece aqui.</p>
          <Link
            href="/"
            className="botao-principal mt-6 px-6 py-3.5"
          >
            Ver as peças <IconeSeta />
          </Link>
      </div>
    );
  }

  if (error || !quote) {
    return <p className="rounded-2xl bg-erro-fundo px-4 py-3 text-erro">{error}</p>;
  }

  const missing = missingForFreeShipping(quote.subtotalCents);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <ul className="flex flex-col gap-3">
        {quote.lines.map((line) => (
          <li key={line.variantId} className="painel flex gap-4 p-4 sm:p-5">
            <Link href={`/produto/${line.productSlug}`} className="moldura relative size-20 shrink-0 rounded-2xl sm:size-28">
              {line.imageUrl && (
                <ImagemPeca src={line.imageUrl} alt="" sizes="112px" inteira={false} />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/produto/${line.productSlug}`} className="font-bold hover:underline">
                    {line.productName}
                  </Link>
                  <p className="flex items-center gap-1.5 text-sm text-tinta-suave">
                    <span className="size-3 rounded-full ring-1 ring-tinta/15" style={{ backgroundColor: line.colorHex }} aria-hidden />
                    {line.variantName} · {line.material}
                  </p>
                </div>
                <p className="shrink-0 text-right font-bold">{formatBRL(line.lineTotalCents)}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <QuantityStepper
                    size="sm"
                    value={line.quantity}
                    max={MAX_QUANTITY_PER_ITEM}
                    label={`Quantidade de ${line.productName}`}
                    onChange={(n) => setCartQuantity(line.variantId, n)}
                  />
                  <span className="text-xs text-tinta-suave">{formatBRL(line.unitPriceCents)} cada</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.variantId)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-tinta-suave transition-colors hover:bg-erro-fundo hover:text-erro"
                >
                  <IconeLixeira className="size-4" /> Remover
                </button>
              </div>
              <SeloPrazo readyToShip={line.readyToShip} productionDays={line.productionDays} className="self-start" />
            </div>
          </li>
        ))}
      </ul>

      <aside className="painel p-5 sm:p-6 lg:sticky lg:top-24" aria-label="Resumo do carrinho">
        <h2 className="titulo text-[1.5rem] leading-none">Resumo</h2>
        <div className="mt-4">
          <CartTotals
            muted={loading}
            subtotalCents={quote.subtotalCents}
            shippingCents={quote.shippingCents}
            totalCents={quote.totalCents}
            leadTimeDays={quote.leadTimeDays}
            shippingLabel="Entrega"
          />
        </div>
        <p className="mt-4 rounded-2xl bg-dourado-claro px-4 py-3 text-sm">
          {FREE_SHIPPING_THRESHOLD_CENTS !== null && missing === 0
            ? "Entrega grátis neste pedido."
            : FREE_SHIPPING_THRESHOLD_CENTS !== null && missing !== null
              ? `Faltam ${formatBRL(missing)} para a entrega grátis.`
              : `Entrega: ${formatBRL(SHIPPING_FEE_CENTS)}.`}{" "}
          Retirada no ateliê é sempre grátis.
        </p>
        <Link
          href="/checkout"
          className="botao-principal mt-5 flex w-full items-center justify-center gap-2 px-6 py-3.5 font-bold"
        >
          Finalizar compra <IconeSeta />
        </Link>
        <Link href="/" className="mt-3 block text-center text-sm font-semibold text-tinta-suave hover:text-tinta">
          Continuar escolhendo
        </Link>
      </aside>
    </div>
  );
}
