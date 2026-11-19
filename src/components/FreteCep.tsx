"use client";

import { useId, useState } from "react";
import type { CartItem } from "@/lib/cart-store";
import { formatBRL } from "@/lib/money";
import { formatCep, onlyDigits, saveCep, useSavedCep, useShipping } from "@/lib/use-shipping";
import { diasUteis } from "@/components/Prazo";
import { inputClass } from "@/components/Campo";
import { IconeCaminhao } from "@/components/Icones";

/** Preço de uma opção como o cliente vê. */
export function precoFrete(cents: number) {
  return cents === 0 ? "Frete grátis" : formatBRL(cents);
}

/**
 * Estimativa de frete pelo CEP (página da peça e carrinho).
 * Só mostra o valor: a escolha da opção acontece no checkout.
 */
export function FreteCep({ items, className = "" }: { items: CartItem[]; className?: string }) {
  const id = useId();
  const saved = useSavedCep();
  const [typed, setTyped] = useState<string | null>(null);
  const cep = typed ?? saved;
  const { quote, loading, error } = useShipping(items, cep);

  return (
    <div className={className}>
      <label htmlFor={id} className="rotulo flex items-center gap-2">
        <IconeCaminhao className="size-4" /> Calcular frete
      </label>
      <div className="mt-2 flex items-center gap-3">
        <input
          id={id}
          value={formatCep(cep)}
          onChange={(e) => {
            const d = onlyDigits(e.target.value);
            setTyped(d);
            if (d.length === 8) saveCep(d);
          }}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          aria-describedby={`${id}-res`}
          className={`${inputClass} max-w-40`}
        />
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-tinta-suave underline hover:text-tinta"
        >
          Não sei meu CEP
        </a>
      </div>
      <div id={`${id}-res`} aria-live="polite" className="mt-3">
        {loading && <div className="h-12 animate-pulse rounded-2xl bg-papel" aria-label="Calculando frete" />}
        {error && <p className="text-sm font-medium text-erro">{error}</p>}
        {quote && (
          <ul className="flex flex-col gap-1.5">
            {quote.options.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 rounded-2xl bg-papel px-4 py-2.5 text-sm">
                <span>
                  <span className="font-semibold">{o.company ? `${o.company} ${o.name}` : o.name}</span>
                  <span className="block text-tinta-suave">
                    Chega em até {diasUteis(quote.leadTimeDays + o.days)}
                  </span>
                </span>
                <span className={`font-bold whitespace-nowrap ${o.priceCents === 0 ? "text-tinta" : ""}`}>{precoFrete(o.priceCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
