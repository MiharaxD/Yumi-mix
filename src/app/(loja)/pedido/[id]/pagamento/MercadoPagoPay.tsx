"use client";

import { useEffect, useState } from "react";

export type ReturnNotice = null | "em_analise" | "recusado" | "erro";

const NOTICES: Record<Exclude<ReturnNotice, null>, { text: string; tone: "info" | "erro" }> = {
  em_analise: {
    text: "Recebemos sua volta do Mercado Pago, mas o pagamento ainda não foi confirmado. Se você pagou com Pix, a confirmação costuma levar alguns segundos: atualize a página.",
    tone: "info",
  },
  recusado: { text: "O pagamento não foi concluído. Seu pedido continua pendente; você pode tentar de novo.", tone: "erro" },
  erro: { text: "Não conseguimos abrir o pagamento agora. Tente de novo em instantes.", tone: "erro" },
};

/** Painel de pagamento com o Checkout Pro: um botão que leva à página segura do Mercado Pago. */
export function MercadoPagoPay({ orderId, notice }: { orderId: string; notice: ReturnNotice }) {
  const [sending, setSending] = useState(false);
  const n = notice ? NOTICES[notice] : null;

  // voltar com o botão do navegador restaura a página do cache: reabilita o botão
  useEffect(() => {
    const reset = () => setSending(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return (
    <div className="painel p-7 sm:p-9">
      <div aria-live="polite">
        {n && (
          <p
            role={n.tone === "erro" ? "alert" : "status"}
            className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
              n.tone === "erro" ? "bg-erro-fundo text-erro" : "bg-dourado-claro text-tinta"
            }`}
          >
            {n.text}
          </p>
        )}
      </div>

      <p className="titulo text-[1.75rem] leading-tight">Pague com Pix, cartão ou saldo</p>
      <p className="mt-2 max-w-prose text-tinta-suave">
        Você vai para o ambiente seguro do Mercado Pago, escolhe a forma de pagamento (Pix, cartão de crédito em até 12x,
        débito ou saldo) e volta para cá ao terminar. A Yumi Mix nunca vê nem guarda os dados do seu cartão.
      </p>

      <form action="/api/pagamentos/checkout" method="POST" onSubmit={() => setSending(true)} className="mt-7">
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          data-mp-checkout-cta="checkout-pro"
          aria-label="Pagar com Mercado Pago"
          disabled={sending}
          className="botao-principal w-full px-7 py-4 text-base font-bold sm:w-auto"
        >
          {sending ? "Abrindo o Mercado Pago…" : "Pagar com Mercado Pago"}
        </button>
      </form>
    </div>
  );
}
