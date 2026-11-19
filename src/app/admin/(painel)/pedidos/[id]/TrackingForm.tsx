"use client";

import { useState, useTransition, type FormEvent } from "react";
import { resendTrackingAction, shipOrderAction, type FormState } from "../../../product-actions";
import { inputClass } from "@/components/Campo";
import { IconeCaminhao, IconeEnvelope } from "@/components/Icones";

export function TrackingForm({
  orderId,
  current,
  emailSentAt,
  shipped,
  canShip,
  trackingHref,
}: {
  orderId: string;
  current: string;
  emailSentAt: string | null;
  shipped: boolean;
  canShip: boolean;
  trackingHref: string | null;
}) {
  const [state, setState] = useState<FormState>({});
  const [pending, start] = useTransition();

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    start(async () => setState(await shipOrderAction({}, fd)));
  }

  if (!canShip && !shipped) {
    return <p className="text-sm text-tinta-suave">O rastreio é liberado quando o pedido estiver pago.</p>;
  }

  return (
    <div>
      <form onSubmit={onSubmit} noValidate>
        <input type="hidden" name="orderId" value={orderId} />
        <label htmlFor="trackingCode" className="rotulo mb-2 block">
          Código de rastreio
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="trackingCode"
            name="trackingCode"
            defaultValue={current}
            placeholder="ex.: AB123456789BR"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={state.fieldErrors?.trackingCode ? true : undefined}
            className={`${inputClass} font-mono tracking-wider uppercase sm:max-w-72`}
          />
          <button type="submit" disabled={pending} className="botao-principal px-5 py-3 text-sm whitespace-nowrap">
            <IconeCaminhao className="size-4" />
            {pending ? "Enviando…" : shipped ? "Corrigir e reenviar" : "Marcar como enviado"}
          </button>
        </div>
        <p className="mt-2 text-xs text-tinta-suave">
          {shipped ? "Trocar o código manda um novo email ao cliente." : "O pedido passa para Enviado e o cliente recebe o código por email."}
        </p>
      </form>

      {shipped && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-foto bg-papel p-4 text-sm">
          <IconeEnvelope className="size-5 shrink-0" />
          <span className="min-w-0 flex-1">
            {emailSentAt ? `Email enviado em ${emailSentAt}.` : "O email ainda não foi enviado."}
            {trackingHref && (
              <>
                {" "}
                <a href={trackingHref} target="_blank" rel="noreferrer" className="font-semibold underline">
                  Ver rastreio
                </a>
              </>
            )}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => setState(await resendTrackingAction(orderId)))}
            className="botao-contorno px-4 py-2 text-sm"
          >
            {emailSentAt ? "Reenviar email" : "Enviar email"}
          </button>
        </div>
      )}

      <div aria-live="polite">
        {state.error && <p className="mt-3 text-sm font-medium text-erro">{state.error}</p>}
        {!state.error && state.ok && state.message && <p className="mt-3 text-sm font-medium">{state.message}</p>}
      </div>
    </div>
  );
}
