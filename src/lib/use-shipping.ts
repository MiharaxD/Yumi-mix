"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { CartItem } from "@/lib/cart-store";
import type { ShippingOption } from "@/lib/pricing";

export type ShippingQuote = { options: ShippingOption[]; leadTimeDays: number; missingForFree: number | null };

// CEP lembrado entre produto, carrinho e checkout
const CEP_KEY = "yumimix:cep";
const CEP_EVENT = "yumimix:cep";

export const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 8);
export const formatCep = (v: string) => {
  const d = onlyDigits(v);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

function readCep(): string {
  try {
    return window.localStorage.getItem(CEP_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveCep(cep: string) {
  try {
    window.localStorage.setItem(CEP_KEY, onlyDigits(cep));
    window.dispatchEvent(new Event(CEP_EVENT));
  } catch {
    /* modo privado: segue sem lembrar */
  }
}

/** CEP salvo no navegador (vazio no servidor). */
export function useSavedCep(): string {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(CEP_EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(CEP_EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    readCep,
    () => "",
  );
}

type State = { key: string; quote: ShippingQuote | null; error: string | null };

/** Cota o frete do carrinho quando o CEP tem 8 números. */
export function useShipping(items: CartItem[], cep: string) {
  const digits = onlyDigits(cep);
  const ready = digits.length === 8 && items.length > 0;
  const key = JSON.stringify({ items, digits });
  const [state, setState] = useState<State>({ key: "", quote: null, error: null });

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    fetch("/api/frete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, cep: digits }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as ShippingQuote & { error?: string };
        if (!res.ok) throw new Error(body.error ?? "Não deu para calcular o frete agora.");
        setState({ key, quote: body, error: null });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setState({ key, quote: null, error: e instanceof Error ? e.message : "Não deu para calcular o frete agora." });
      });
    return () => controller.abort();
    // `key` resume itens e CEP
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  const fresh = state.key === key;
  return {
    quote: ready && fresh ? state.quote : null,
    loading: ready && !fresh,
    error: ready && fresh ? state.error : null,
  };
}
