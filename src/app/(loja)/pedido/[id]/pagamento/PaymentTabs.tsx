"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import { IconeCheck } from "@/components/Icones";

type Props = {
  orderId: string;
  pix: { copyPaste: string; qrImageSrc: string; expiresAtLabel: string };
  simulation: boolean;
};

const TABS = [
  { id: "pix", label: "Pix" },
  { id: "cartao", label: "Cartão" },
] as const;

export function PaymentTabs({ orderId, pix, simulation }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pix");
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState<null | "approved" | "rejected">(null);
  const [error, setError] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(pix.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  async function simulate(outcome: "approved" | "rejected") {
    setPending(outcome);
    setError(null);
    try {
      const res = await fetch("/api/pagamentos/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, outcome }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
      if (res.ok && body.ok) {
        router.refresh();
        return;
      }
      setError(body.message ?? body.error ?? "Não foi possível processar o pagamento.");
    } catch {
      setError("Sem conexão com a loja. Tente de novo.");
    }
    setPending(null);
  }

  const simButtons = simulation ? (
    <div className="mt-6 rounded-[1.25rem] bg-papel p-5">
      <p className="text-sm font-semibold">Modo de teste</p>
      <p className="mt-0.5 text-sm text-tinta-suave">Nenhum dinheiro circula. Escolha o que o provedor responderia:</p>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => simulate("approved")}
          disabled={pending !== null}
          className="botao-principal px-5 py-3 font-bold"
        >
          {pending === "approved" ? "Aprovando…" : "Simular pagamento aprovado"}
        </button>
        <button
          type="button"
          onClick={() => simulate("rejected")}
          disabled={pending !== null}
          className="botao-contorno px-5 py-3"
        >
          {pending === "rejected" ? "Enviando…" : "Simular pagamento recusado"}
        </button>
      </div>
    </div>
  ) : (
    <p className="mt-6 rounded-2xl bg-papel px-4 py-3 text-sm text-tinta-suave">
      A simulação de pagamento fica desligada em produção.
    </p>
  );

  return (
    <div className="painel p-5 sm:p-8">
      <div role="tablist" aria-label="Forma de pagamento" className="inline-flex rounded-full bg-papel p-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`aba-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`painel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
              tab === t.id ? "bg-branco text-tinta shadow-cartao" : "text-tinta-suave hover:text-tinta"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div aria-live="assertive">
        {error && (
          <p className="mt-5 rounded-2xl bg-erro-fundo px-4 py-3 text-sm font-medium text-erro" role="alert">
            {error} Seu pedido continua pendente; você pode tentar de novo.
          </p>
        )}
      </div>

      <div role="tabpanel" id="painel-pix" aria-labelledby="aba-pix" hidden={tab !== "pix"} className="mt-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="mx-auto w-48 shrink-0 rounded-[1.25rem] bg-white p-3 shadow-[inset_0_0_0_1.5px_var(--color-linha)] sm:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR gerado como data URI */}
            <img src={pix.qrImageSrc} alt="QR code Pix de teste (não é um Pix real)" className="aspect-square w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Pague com o app do seu banco</p>
            <p className="mt-1 text-sm text-tinta-suave">
              Leia o QR code ou copie o código abaixo. Este código é fictício e válido até {pix.expiresAtLabel}.
            </p>
            <label htmlFor="pix-copia-cola" className="mt-4 block text-sm font-semibold">
              Pix copia e cola
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="pix-copia-cola"
                readOnly
                value={pix.copyPaste}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 truncate rounded-campo bg-papel px-4 py-3 font-mono text-xs"
              />
              <button
                type="button"
                onClick={copy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-tinta px-5 text-sm font-semibold text-branco transition-colors hover:bg-[#2b2d33]"
              >
                {copied ? (
                  <>
                    <IconeCheck className="size-4" /> Copiado
                  </>
                ) : (
                  "Copiar"
                )}
              </button>
            </div>
          </div>
        </div>
        {simButtons}
      </div>

      <div role="tabpanel" id="painel-cartao" aria-labelledby="aba-cartao" hidden={tab !== "cartao"} className="mt-6">
        <p className="font-semibold">Cartão de crédito</p>
        <p className="mt-1 max-w-prose text-sm text-tinta-suave">
          Quando a loja abrir de verdade, o pagamento com cartão acontece no ambiente seguro do provedor de pagamento. A
          Yumi Mix nunca pede nem guarda os dados do seu cartão.
        </p>
        {simButtons}
      </div>
    </div>
  );
}
