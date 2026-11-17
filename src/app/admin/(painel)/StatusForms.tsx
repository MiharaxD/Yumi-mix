"use client";

import { useActionState } from "react";
import {
  saveQuoteAction,
  updateCustomStatusAction,
  updateOrderStatusAction,
  type ActionState,
} from "../actions";
import { inputClass } from "@/components/Campo";

function Feedback({ state }: { state: ActionState }) {
  return (
    <div aria-live="polite" className="min-h-5">
      {state.error && <p className="mt-2 text-sm font-medium text-erro">{state.error}</p>}
      {state.ok && state.message && <p className="mt-2 text-sm font-medium text-tinta-suave">{state.message}</p>}
    </div>
  );
}

type Option = { value: string; label: string };

function TransitionButtons({
  options,
  pending,
  emptyLabel,
}: {
  options: Option[];
  pending: boolean;
  emptyLabel: string;
}) {
  if (options.length === 0) return <p className="text-sm text-tinta-suave">{emptyLabel}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="submit"
          name="status"
          value={o.value}
          disabled={pending}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
            o.value === "cancelado" || o.value === "recusada"
              ? "border border-erro/40 text-erro hover:bg-erro-fundo"
              : "bg-tinta text-branco hover:bg-tinta-suave"
          }`}
        >
          {o.value === "cancelado" ? "Cancelar pedido" : `Mudar para ${o.label}`}
        </button>
      ))}
    </div>
  );
}

export function OrderStatusForm({ orderId, options }: { orderId: string; options: Option[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateOrderStatusAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      <TransitionButtons options={options} pending={pending} emptyLabel="Status final: não há próximos passos." />
      <Feedback state={state} />
    </form>
  );
}

export function QuoteForm({ requestId, current, locked }: { requestId: string; current: string; locked: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveQuoteAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      <label htmlFor={`preco-${requestId}`} className="mb-1.5 block text-sm font-semibold">
        Preço orçado (R$)
      </label>
      <div className="flex gap-2">
        <input
          id={`preco-${requestId}`}
          name="price"
          inputMode="decimal"
          placeholder="ex.: 149,90"
          defaultValue={current}
          disabled={locked}
          className={`${inputClass} max-w-40`}
        />
        <button
          type="submit"
          disabled={pending || locked}
          className="bg-tinta px-4 text-sm font-semibold text-branco hover:bg-tinta-suave disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function CustomStatusForm({ requestId, options }: { requestId: string; options: Option[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateCustomStatusAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      <TransitionButtons options={options} pending={pending} emptyLabel="Status final: não há próximos passos." />
      <Feedback state={state} />
    </form>
  );
}
