"use client";

import { ImagemPeca } from "@/components/ImagemPeca";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { clearCart, useCart, useHydrated } from "@/lib/cart-store";
import { useQuote } from "@/lib/use-quote";
import { formatCep, onlyDigits, saveCep, useSavedCep, useShipping } from "@/lib/use-shipping";
import { checkoutSchema, UFS } from "@/lib/schemas";
import { formatBRL } from "@/lib/money";
import { Campo, CampoSelect } from "@/components/Campo";
import { CartTotals } from "@/components/CartSummary";
import { precoFrete } from "@/components/FreteCep";
import { diasUteis } from "@/components/Prazo";
import { IconeCheck, IconeSeta } from "@/components/Icones";

type Errors = Record<string, string>;

const FIELDS = [
  "customerName",
  "email",
  "whatsapp",
  "cep",
  "street",
  "streetNumber",
  "complement",
  "neighborhood",
  "city",
  "uf",
  "shippingOptionId",
] as const;

type Address = { street: string; neighborhood: string; city: string; uf: string };
type Lookup = { cep: string; status: "ok" | "parcial" | "nao-achou" | "erro" } | null;

/** Busca o endereço do CEP na ViaCEP (pública, direto do navegador). */
async function buscarCep(cep: string, signal: AbortSignal): Promise<Address | null> {
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
  if (!res.ok) throw new Error("viacep");
  const d = (await res.json()) as { erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
  if (d.erro) return null;
  return { street: d.logradouro ?? "", neighborhood: d.bairro ?? "", city: d.localidade ?? "", uf: d.uf ?? "" };
}

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCart();
  const { quote, loading, error: quoteError } = useQuote(items);

  const saved = useSavedCep();
  const [typedCep, setTypedCep] = useState<string | null>(null);
  const cep = typedCep ?? saved;
  const cepDigits = onlyDigits(cep);
  const frete = useShipping(items, cep);
  const [chosen, setChosen] = useState<string | null>(null);
  const options = frete.quote?.options ?? [];
  const selected = options.find((o) => o.id === chosen) ?? options[0] ?? null;

  const [addr, setAddr] = useState<Address>({ street: "", neighborhood: "", city: "", uf: "" });
  const [lookup, setLookup] = useState<Lookup>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  // CEP completo: preenche rua, bairro, cidade e UF
  useEffect(() => {
    if (cepDigits.length !== 8) return;
    const controller = new AbortController();
    buscarCep(cepDigits, controller.signal)
      .then((found) => {
        if (!found) {
          setLookup({ cep: cepDigits, status: "nao-achou" });
          return;
        }
        setAddr(found);
        setLookup({ cep: cepDigits, status: found.street ? "ok" : "parcial" });
        // CEP de cidade inteira vem sem rua: o foco vai para a rua; senão, para o número
        if (found.street) numberRef.current?.focus();
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setLookup({ cep: cepDigits, status: "erro" });
      });
    return () => controller.abort();
  }, [cepDigits]);

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

  const lookupNow = lookup?.cep === cepDigits ? lookup.status : null;
  const cepHint =
    cepDigits.length < 8
      ? "Digite o CEP e o endereço se preenche sozinho."
      : lookupNow === "ok"
        ? "Endereço encontrado. Confira e complete o número."
        : lookupNow === "parcial"
          ? "Achamos a cidade. Complete rua e bairro."
          : lookupNow === "nao-achou"
            ? "Não achamos esse CEP. Confira o número ou preencha à mão."
            : lookupNow === "erro"
              ? "Não deu para buscar o endereço agora. Preencha à mão."
              : "Buscando endereço…";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(FIELDS.map((f) => [f, String(fd.get(f) ?? "")])),
      shippingOptionId: selected?.id ?? "",
      items,
    };

    const local = checkoutSchema.safeParse(payload);
    if (!local.success) {
      const errs: Errors = {};
      for (const issue of local.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      setFormError("Confira os campos destacados.");
      const first = FIELDS.find((f) => errs[f]);
      if (first) document.getElementById(first === "shippingOptionId" ? "frete" : first)?.focus();
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

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">
        <fieldset className="painel min-w-0 p-5 sm:p-8">
          <legend className="float-left titulo mb-6 w-full text-[1.5rem] leading-none">Seus dados</legend>
          <div className="clear-both grid gap-4 sm:grid-cols-2">
            <Campo
              className="sm:col-span-2"
              label="Nome completo"
              name="customerName"
              autoComplete="name"
              required
              error={errors.customerName}
              hint="Nome e sobrenome, como vai na etiqueta do pacote."
            />
            <Campo
              label="Email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              error={errors.email}
              hint="O código de rastreio chega por aqui."
            />
            <Campo
              label="Telefone (WhatsApp)"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(11) 91234-5678"
              required
              error={errors.whatsapp}
              hint="Com DDD, para falarmos com você se precisar."
            />
          </div>
        </fieldset>

        <fieldset className="painel min-w-0 p-5 sm:p-8">
          <legend className="float-left titulo mb-6 w-full text-[1.5rem] leading-none">Endereço de entrega</legend>
          <div className="clear-both grid grid-cols-6 gap-4">
            <Campo
              className="col-span-6 sm:col-span-3"
              label="CEP"
              name="cep"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              required
              value={formatCep(cep)}
              onChange={(ev) => {
                const d = onlyDigits(ev.target.value);
                setTypedCep(d);
                if (d.length === 8) saveCep(d);
              }}
              error={errors.cep}
              hint={cepHint}
            />
            <Campo
              className="col-span-6"
              label="Rua"
              name="street"
              autoComplete="address-line1"
              required
              value={addr.street}
              onChange={(ev) => setAddr((a) => ({ ...a, street: ev.target.value }))}
              error={errors.street}
            />
            <Campo
              ref={numberRef}
              className="col-span-2"
              label="Número"
              name="streetNumber"
              autoComplete="address-line2"
              required
              error={errors.streetNumber}
            />
            <Campo
              className="col-span-4"
              label="Complemento (opcional)"
              name="complement"
              placeholder="Apto, bloco, casa 2…"
              autoComplete="address-line3"
              error={errors.complement}
            />
            <Campo
              className="col-span-6 sm:col-span-2"
              label="Bairro"
              name="neighborhood"
              required
              value={addr.neighborhood}
              onChange={(ev) => setAddr((a) => ({ ...a, neighborhood: ev.target.value }))}
              error={errors.neighborhood}
            />
            <Campo
              className="col-span-4 sm:col-span-3"
              label="Cidade"
              name="city"
              autoComplete="address-level2"
              required
              value={addr.city}
              onChange={(ev) => setAddr((a) => ({ ...a, city: ev.target.value }))}
              error={errors.city}
            />
            <CampoSelect
              className="col-span-2 sm:col-span-1"
              label="UF"
              name="uf"
              autoComplete="address-level1"
              required
              value={addr.uf}
              onChange={(ev) => setAddr((a) => ({ ...a, uf: ev.target.value }))}
              error={errors.uf}
            >
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

        <fieldset className="painel min-w-0 p-5 sm:p-8" aria-describedby="frete-status">
          <legend id="frete" tabIndex={-1} className="float-left titulo mb-5 w-full text-[1.5rem] leading-none">
            Frete
          </legend>
          <div className="clear-both" id="frete-status" aria-live="polite">
            {cepDigits.length < 8 ? (
              <p className="rounded-2xl bg-papel px-4 py-3.5 text-sm text-tinta-suave">
                Digite o CEP acima para ver as opções de entrega.
              </p>
            ) : frete.loading ? (
              <div className="grid gap-3 sm:grid-cols-2" aria-label="Calculando frete">
                <div className="h-20 animate-pulse rounded-chip bg-papel" />
                <div className="h-20 animate-pulse rounded-chip bg-papel" />
              </div>
            ) : frete.error ? (
              <p className="rounded-2xl bg-erro-fundo px-4 py-3.5 text-sm font-medium text-erro">{frete.error}</p>
            ) : (
              <div role="radiogroup" aria-label="Opções de frete" className="grid gap-3 sm:grid-cols-2">
                {options.map((opt) => {
                  const checked = selected?.id === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className="chip-variante flex cursor-pointer gap-3 p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-tinta"
                      aria-checked={checked}
                    >
                      <input
                        type="radio"
                        name="shippingOptionId"
                        value={opt.id}
                        checked={checked}
                        onChange={() => setChosen(opt.id)}
                        className="mt-1 size-4 accent-tinta"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-bold">{opt.company ? `${opt.company} ${opt.name}` : opt.name}</span>
                          <span className="font-bold whitespace-nowrap">{precoFrete(opt.priceCents)}</span>
                        </span>
                        <span className="mt-0.5 block text-sm text-tinta-suave">
                          Chega em até {diasUteis((quote?.leadTimeDays ?? 0) + opt.days)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.shippingOptionId && <p className="mt-2 text-sm font-medium text-erro">{errors.shippingOptionId}</p>}
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
                muted={loading || frete.loading}
                subtotalCents={quote.subtotalCents}
                shippingCents={selected ? selected.priceCents : null}
                shippingDays={selected ? selected.days : null}
                leadTimeDays={quote.leadTimeDays}
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
          disabled={submitting || !quote || !selected}
          className="botao-principal mt-5 flex w-full items-center justify-center gap-2 px-6 py-3.5 font-bold"
        >
          {submitting ? "Registrando pedido…" : "Ir para o pagamento"}
          {!submitting && <IconeSeta />}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-tinta-suave">
          {selected ? (
            <>
              <IconeCheck className="size-3.5" /> O valor final é conferido pela loja antes do pagamento.
            </>
          ) : (
            "Preencha o CEP para liberar o pagamento."
          )}
        </p>
      </aside>
    </form>
  );
}
