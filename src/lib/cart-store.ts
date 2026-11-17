"use client";

import { useSyncExternalStore } from "react";
import { MAX_QUANTITY_PER_ITEM } from "@/config";

export type CartItem = { variantId: string; quantity: number };

const KEY = "yumimix:carrinho:v1";
const EVENT = "yumimix:carrinho";
const EMPTY: CartItem[] = [];

let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY;

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed)
      ? parsed
          .filter(
            (i): i is CartItem =>
              typeof i?.variantId === "string" && Number.isInteger(i?.quantity) && i.quantity > 0,
          )
          .map((i) => ({ variantId: i.variantId, quantity: Math.min(i.quantity, MAX_QUANTITY_PER_ITEM) }))
      : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // armazenamento indisponível (aba anônima/bloqueio): o carrinho vale só nesta página
  }
  cachedRaw = null;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

const noopSubscribe = () => () => {};

/** false no servidor e na hidratação; true depois que o navegador assumiu. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useCartCount(): number {
  return useCart().reduce((n, i) => n + i.quantity, 0);
}

export function addToCart(variantId: string, quantity: number) {
  const items = [...read()];
  const existing = items.find((i) => i.variantId === variantId);
  if (existing) {
    const merged = { ...existing, quantity: Math.min(existing.quantity + quantity, MAX_QUANTITY_PER_ITEM) };
    write(items.map((i) => (i.variantId === variantId ? merged : i)));
  } else {
    write([...items, { variantId, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }]);
  }
}

export function setCartQuantity(variantId: string, quantity: number) {
  const q = Math.max(1, Math.min(quantity, MAX_QUANTITY_PER_ITEM));
  write(read().map((i) => (i.variantId === variantId ? { ...i, quantity: q } : i)));
}

export function removeFromCart(variantId: string) {
  write(read().filter((i) => i.variantId !== variantId));
}

export function removeManyFromCart(variantIds: string[]) {
  write(read().filter((i) => !variantIds.includes(i.variantId)));
}

export function clearCart() {
  write([]);
}
