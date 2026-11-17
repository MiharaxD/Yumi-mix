"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/cart-store";
import type { DeliveryMethod } from "@/lib/pricing";

export type Quote = {
  lines: {
    variantId: string;
    productSlug: string;
    productName: string;
    variantName: string;
    material: string;
    colorHex: string;
    imageUrl: string | null;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
    readyToShip: boolean;
    productionDays: number;
  }[];
  unavailable: string[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  leadTimeDays: number;
};

type State = { key: string; quote: Quote | null; error: string | null };

/** Pede ao servidor a cotação do carrinho (preços vêm do banco). */
export function useQuote(items: CartItem[], deliveryMethod: DeliveryMethod) {
  const key = JSON.stringify({ items, deliveryMethod });
  const [state, setState] = useState<State>({ key: "", quote: null, error: null });

  useEffect(() => {
    if (items.length === 0) return;
    const controller = new AbortController();
    fetch("/api/carrinho/cotacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, deliveryMethod }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("cotacao");
        const quote = (await res.json()) as Quote;
        setState({ key, quote, error: null });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setState({ key, quote: null, error: "Não deu para calcular o carrinho agora. Recarregue a página." });
      });
    return () => controller.abort();
    // `key` resume items e deliveryMethod
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const fresh = state.key === key;
  return {
    quote: items.length === 0 ? null : state.quote,
    loading: items.length > 0 && !fresh,
    error: fresh ? state.error : null,
  };
}
