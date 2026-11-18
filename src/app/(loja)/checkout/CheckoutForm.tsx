"use client";

import { ImagemPeca } from "@/components/ImagemPeca";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { clearCart, useCart, useHydrated } from "@/lib/cart-store";
import { useQuote } from "@/lib/use-quote";
import { checkoutSchema, UFS } from "@/lib/schemas";
import { formatBRL } from "@/lib/money";
import type { DeliveryMethod } from "@/lib/pricing";
import { FREE_SHIPPING_THRESHOLD_CENTS, PICKUP_NOTE, SHIPPING_FEE_CENTS } from "@/config";
import { Campo, CampoSelect } from "@/components/Campo";
import { CartTotals } from "@/components/CartSummary";
import { IconeSeta } from "@/components/Icones";

type Errors = Record<string, string>;

const FIELDS = ["customerName", "email", "whatsapp", "cep", "street", "streetNumber", "city", "uf"] as const;

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCart();
  const [delivery, setDelivery] = useState<DeliveryMethod>("entrega");
  const { quote, loading, error: quoteError } = useQuote(items, delivery);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!hydrated || placed) {
    return <div className="h-96 animate-pulse rounded-cartao bg-nevoa" aria-busy="true" aria-label="Carregando" />;
  }

  if (items.length === 0) {
    return (
      <div className="painel max-w-lg p-7">
        <p className="font-semibold">Seu carrinho está vazio.</p>
        <Link href="/" className="mt-3 inline-flex items-center gap-2 font-semibold underline">
          Escolher peças <IconeSeta className="size-4" />
        </Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(FIELDS.map((f) => [f, String(fd.get(f) ?? "")])),
      deliveryMethod: delivery,
      items,
    };

    const local = checkoutSchema.safeParse(payload);
    if (!local.success) {
      const errs: Errors = {};
      for (const issue of local.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      setFormError("Confira os campos destacados.");
      const first = FIELDS.find((f) => errs[f]);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string; fieldErrors?: Errors };
      if (!res.ok || !body.id) {
        setErrors(body.fieldErrors ?? {});
        setFormError(body.error ?? "Não conseguimos registrar o pedido. Tente de novo.");
        setSubmitting(false);
        return;
      }
      setPlaced(true);
      clearCart();
      router.push(`/pedido/${body.id}/pagamento`);
    } catch {
      setFormError("Sem conexão com a loja. Confira a internet e tente de novo.");
      setSubmitting(false);
    }
  }

  const freeNote =
    FREE_SHIPPING_THRESHOLD_CENTS !== null
      ? `${formatBRL(SHIPPING_FEE_CENTS)} · grátis a partir de ${formatBRL(FREE_SHIPPING_THRESHOLD_CENTS)}`
      : formatBRL(SHIPPING_FEE_CENTS);

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">
        <fieldset className="painel min-w-0 p-5 sm:p-8">
          <legend className="float-left titulo mb-6 w-full text-[1.5rem] leading-none">Seus dados</legend>
          <div className="clear-both grid gap-4 sm:grid-cols-2">
            <Campo className="sm:col-span-2" label="Nome completo" name="customerName" autoComplete="name" error={errors.customerName} />
            <Campo label="Email" name="email" type="email" inputMode="email" autoComplete="email" error={errors.email} />
            <Campo
              label="WhatsApp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(11) 91234-5678"
              error={errors.whatsapp}
              hint="Com DDD. É por lá que combinamos a entrega."
            />
          </div>
        </fieldset>

        <fieldset className="painel min-w-0 p-5 sm:p-8">
          <legend className="float-left titulo mb-6 w-full text-[1.5rem] leading-none">Endereço</legend>
          <div className="clear-both grid grid-cols-6 gap-4">
            <Campo className="col-span-6 sm:col-span-2" label="CEP" name="cep" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" error={errors.cep} />
            <Campo className="col-span-6 sm:col-span-4" label="Rua" name="street" autoComplete="address-line1" error={errors.street} />
            <Campo className="col-span-2" label="Número" name="streetNumber" error={errors.streetNumber} />
            <Campo className="col-span-4 sm:col-span-3" label="Cidade" name="city" autoComplete="address-level2" error={errors.city} />
            <CampoSelect className="col-span-6 sm:col-span-1" label="UF" name="uf" autoComplete="address-level1" defaultValue="" error={errors.uf}>
              <option value="" disabled>
                UF
              </option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </CampoSelect>
          </div>
        </fieldset>

        <fieldset className="painel min-w-0 p-5 sm:p-8">
          <legend className="float-left titulo mb-5 w-full text-[1.5rem] leading-none">Como você quer receber?</legend>
          <div className="clear-both grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: "entrega", title: "Entrega", detail: freeNote },
                { value: "retirada", title: "Retirada no ateliê", detail: `Grátis. ${PICKUP_NOTE}` },
              ] as const
            ).map((opt) => {
              const checked = delivery === opt.value;
              return (
                <label
                  key={opt.value}
                  className="chip-variante flex cursor-pointer gap-3 p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-tinta"
                  aria-checked={checked}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={opt.value}
                    checked={checked}
                    onChange={() => setDelivery(opt.value)}
                    className="mt-1 size-4 accent-tinta"
                  />
                  <span>
                    <span className="block font-bold">{opt.title}</span>
                    <span className="mt-0.5 block text-sm text-tinta-suave">{opt.detail}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <aside className="painel p-5 sm:p-6 lg:sticky lg:top-24" aria-label="Resumo do pedido">
        <h2 className="titulo text-[1.5rem] leading-none">Seu pedido</h2>
        {quoteError && <p className="mt-3 text-sm text-erro">{quoteError}</p>}
        {quote ? (
          <>
            <ul className="mt-4 flex flex-col gap-3 pb-1">
              {quote.lines.map((l) => (
                <li key={l.variantId} className="flex items-center gap-3 text-sm">
                  <span className="moldura relative size-12 shrink-0 rounded-xl">
                    {l.imageUrl && <ImagemPeca src={l.imageUrl} alt="" sizes="48px" inteira={false} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {l.quantity} × {l.productName}
                    </span>
                    <span className="block truncate text-tinta-suave">{l.variantName}</span>
                  </span>
                  <span className="font-semibold">{formatBRL(l.lineTotalCents)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <CartTotals
                muted={loading}
                subtotalCents={quote.subtotalCents}
                shippingCents={quote.shippingCents}
                totalCents={quote.totalCents}
                leadTimeDays={quote.leadTimeDays}
                shippingLabel={delivery === "entrega" ? "Entrega" : "Retirada"}
              />
            </div>
          </>
        ) : (
          <div className="mt-4 h-40 animate-pulse rounded-2xl bg-papel" />
        )}

        <div aria-live="assertive">
          {formError && <p className="mt-4 rounded-2xl bg-erro-fundo px-4 py-3 text-sm font-medium text-erro">{formError}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting || !quote}
          className="botao-principal mt-5 flex w-full items-center justify-center gap-2 px-6 py-3.5 font-bold"
        >
          {submitting ? "Registrando pedido…" : "Ir para o pagamento"}
          {!submitting && <IconeSeta />}
        </button>
        <p className="mt-3 text-center text-xs text-tinta-suave">O valor final é conferido pela loja antes do pagamento.</p>
      </aside>
    </form>
  );
}
