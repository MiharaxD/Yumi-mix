"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveShippingSettingsAction, type FormState } from "../../product-actions";
import { Campo } from "@/components/Campo";

export function ShippingSettingsForm({
  initial,
}: {
  initial: { originCep: string; freeOn: boolean; freeThreshold: string; fallbackShipping: string; fallbackDays: number };
}) {
  const [state, setState] = useState<FormState>({});
  const [pending, start] = useTransition();
  const [freeOn, setFreeOn] = useState(initial.freeOn);
  const e = state.fieldErrors ?? {};

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    start(async () => setState(await saveShippingSettingsAction({}, fd)));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="painel flex flex-col gap-6 p-5 sm:p-7">
      <Campo
        label="CEP de onde saem os envios"
        name="originCep"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="00000-000"
        defaultValue={initial.originCep}
        error={e.originCep}
        hint="Sem ele o Melhor Envio não cota e a loja usa o valor fixo abaixo."
        className="max-w-xs"
      />

      <div>
        <label className="chip-variante flex cursor-pointer items-start gap-3 p-4" aria-checked={freeOn}>
          <input
            type="checkbox"
            name="freeOn"
            checked={freeOn}
            onChange={(ev) => setFreeOn(ev.target.checked)}
            className="mt-1 size-4 accent-tinta"
          />
          <span>
            <span className="block font-bold">Frete grátis por valor do pedido</span>
            <span className="mt-0.5 block text-sm text-tinta-suave">
              A partir do valor abaixo, a opção mais barata sai de graça (a loja paga a diferença).
            </span>
          </span>
        </label>
        {freeOn && (
          <Campo
            label="Grátis a partir de (R$)"
            name="freeThreshold"
            inputMode="decimal"
            defaultValue={initial.freeThreshold}
            error={e.freeThreshold}
            className="mt-4 max-w-xs"
          />
        )}
      </div>

      <div>
        <h2 className="rotulo">Plano B (sem Melhor Envio)</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Usado enquanto o Melhor Envio não estiver configurado ou se ele sair do ar. O frete embutido dos produtos também é
          abatido deste valor.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Valor fixo (R$)" name="fallbackShipping" inputMode="decimal" defaultValue={initial.fallbackShipping} error={e.fallbackShipping} />
          <Campo label="Prazo de entrega (dias úteis)" name="fallbackDays" type="number" inputMode="numeric" defaultValue={initial.fallbackDays} error={e.fallbackDays} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="botao-principal px-6 py-3 text-sm">
          {pending ? "Salvando…" : "Salvar frete"}
        </button>
        <p aria-live="polite" className="text-sm font-medium">
          {state.error ? <span className="text-erro">{state.error}</span> : state.ok ? state.message : null}
        </p>
      </div>
    </form>
  );
}
