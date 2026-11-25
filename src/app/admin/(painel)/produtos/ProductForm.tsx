"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveProductAction, type FormState } from "../../product-actions";
import { Campo, CampoSelect, CampoTexto, inputClass } from "@/components/Campo";
import { IconeLixeira, IconeMais } from "@/components/Icones";

export type ProductFormValues = {
  id: string;
  name: string;
  description: string;
  dimensions: string;
  categoryId: string;
  readyToShip: boolean;
  productionDays: number;
  shopeeUrl: string;
  mercadoLivreUrl: string;
  shopeePrice: string;
  mercadoLivrePrice: string;
  shippingCredit: string;
  weightGrams: number;
  boxHeightCm: number;
  boxWidthCm: number;
  boxLengthCm: number;
  variants: VariantRow[];
};

type VariantRow = { key: string; id: string; name: string; material: string; colorHex: string; price: string };

let seq = 0;
const newRow = (): VariantRow => ({ key: `nova-${++seq}`, id: "", name: "", material: "PLA", colorHex: "#f2f1ec", price: "" });

export const EMPTY_PRODUCT: ProductFormValues = {
  id: "",
  name: "",
  description: "",
  dimensions: "",
  categoryId: "",
  readyToShip: true,
  productionDays: 3,
  shopeeUrl: "",
  mercadoLivreUrl: "",
  shopeePrice: "",
  mercadoLivrePrice: "",
  shippingCredit: "0,00",
  weightGrams: 300,
  boxHeightCm: 10,
  boxWidthCm: 15,
  boxLengthCm: 20,
  variants: [],
};

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <fieldset className="painel min-w-0 p-5 sm:p-7">
      <legend className="float-left mb-5 w-full">
        <span className="titulo block text-[1.375rem] leading-none">{titulo}</span>
        {descricao && <span className="mt-2 block text-sm text-tinta-suave">{descricao}</span>}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const [state, setState] = useState<FormState>({});
  const [pending, start] = useTransition();
  const [rows, setRows] = useState<VariantRow[]>(initial.variants.length ? initial.variants : [newRow()]);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [readyToShip, setReadyToShip] = useState(initial.readyToShip);
  const e = state.fieldErrors ?? {};

  const update = (key: string, patch: Partial<VariantRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const variantsJson = JSON.stringify(rows.map(({ id, name, material, colorHex, price }) => ({ id, name, material, colorHex, price })));

  // envio manual: com `action={...}` o React limpa os campos depois de cada envio
  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    start(async () => {
      const result = await saveProductAction({}, fd);
      setState(result);
      // variações novas ganham id: o próximo salvar edita em vez de duplicar
      if (result.variantIds) {
        const ids = result.variantIds;
        setRows((rs) => rs.map((r, i) => ({ ...r, id: ids[i] ?? r.id })));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <input type="hidden" name="productId" value={initial.id} />
      <input type="hidden" name="variants" value={variantsJson} />

      <Secao titulo="Anúncio" descricao="O que o cliente vê na página da peça.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo className="sm:col-span-2" label="Nome da peça" name="name" defaultValue={initial.name} error={e.name} />
          <CampoTexto
            className="sm:col-span-2"
            label="Descrição"
            name="description"
            defaultValue={initial.description}
            error={e.description}
            rows={5}
          />
          <Campo
            label="Medidas (para o cliente)"
            name="dimensions"
            defaultValue={initial.dimensions}
            placeholder="ex.: 12 × 8 × 5 cm"
            error={e.dimensions}
          />
          <CampoSelect
            label="Categoria"
            name="categoryId"
            value={categoryId}
            onChange={(ev) => setCategoryId(ev.target.value)}
            error={e.categoryId}
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__nova__">+ Nova categoria…</option>
          </CampoSelect>
          {categoryId === "__nova__" && (
            <Campo
              className="sm:col-start-2"
              label="Nome da nova categoria"
              name="newCategory"
              placeholder="ex.: Cozinha"
              error={e.newCategory}
              autoFocus
            />
          )}
        </div>
      </Secao>

      <Secao titulo="Variações e preço" descricao="Cada cor ou acabamento com o seu preço. O preço já inclui o frete embutido.">
        <ul className="flex flex-col gap-3">
          {rows.map((r, i) => {
            const err = (f: string) => e[`variants.${i}.${f}`];
            return (
              <li key={r.key} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-foto bg-papel p-3 sm:grid-cols-[auto_1.2fr_1fr_8rem_auto]">
                <label className="relative mt-1 block size-11 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-tinta/15 ring-inset" style={{ backgroundColor: r.colorHex }}>
                  <span className="sr-only">Cor da variação {i + 1}</span>
                  <input
                    type="color"
                    value={r.colorHex}
                    onChange={(ev) => update(r.key, { colorHex: ev.target.value })}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
                <div className="min-w-0">
                  <label className="sr-only" htmlFor={`v-nome-${r.key}`}>Nome da variação {i + 1}</label>
                  <input
                    id={`v-nome-${r.key}`}
                    value={r.name}
                    onChange={(ev) => update(r.key, { name: ev.target.value })}
                    placeholder="Nome (ex.: Branco)"
                    aria-invalid={err("name") ? true : undefined}
                    className={`${inputClass} bg-branco`}
                  />
                  {err("name") && <p className="mt-1 text-sm font-medium text-erro">{err("name")}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                  disabled={rows.length === 1}
                  aria-label={`Remover variação ${r.name || i + 1}`}
                  className="botao-redondo mt-0.5 size-11 text-tinta-suave hover:text-erro disabled:opacity-30 sm:order-last"
                >
                  <IconeLixeira className="size-4" />
                </button>
                <div className="col-span-3 min-w-0 sm:col-span-1">
                  <label className="sr-only" htmlFor={`v-mat-${r.key}`}>Material da variação {i + 1}</label>
                  <input
                    id={`v-mat-${r.key}`}
                    value={r.material}
                    onChange={(ev) => update(r.key, { material: ev.target.value })}
                    placeholder="Material (ex.: PLA)"
                    className={`${inputClass} bg-branco`}
                  />
                </div>
                <div className="col-span-3 min-w-0 sm:col-span-1">
                  <label className="sr-only" htmlFor={`v-preco-${r.key}`}>Preço da variação {i + 1}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-tinta-suave">R$</span>
                    <input
                      id={`v-preco-${r.key}`}
                      value={r.price}
                      onChange={(ev) => update(r.key, { price: ev.target.value })}
                      inputMode="decimal"
                      placeholder="39,90"
                      aria-invalid={err("price") ? true : undefined}
                      className={`${inputClass} bg-branco pl-11`}
                    />
                  </div>
                  {err("price") && <p className="mt-1 text-sm font-medium text-erro">{err("price")}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        {e.variants && <p className="mt-2 text-sm font-medium text-erro">{e.variants}</p>}
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, newRow()])}
          disabled={rows.length >= 20}
          className="botao-contorno mt-4 px-4 py-2.5 text-sm"
        >
          <IconeMais className="size-4" /> Adicionar variação
        </button>
      </Secao>

      <Secao
        titulo="Onde comprar"
        descricao="A compra acontece no marketplace: o botão da página da peça leva para estes anúncios. Mesmo anúncio em mais de um link? Cole todos separados por espaço: o botão alterna entre eles. Sem nenhum link, a peça aparece como “em breve”. Com o preço das duas lojas, a mais barata ganha o selo “Promoção”."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Link na Shopee"
            name="shopeeUrl"
            inputMode="url"
            defaultValue={initial.shopeeUrl}
            placeholder="https://shopee.com.br/…"
            error={e.shopeeUrl}
          />
          <Campo
            label="Link no Mercado Livre"
            name="mercadoLivreUrl"
            inputMode="url"
            defaultValue={initial.mercadoLivreUrl}
            placeholder="https://produto.mercadolivre.com.br/…"
            error={e.mercadoLivreUrl}
          />
          <Campo
            label="Preço na Shopee (R$)"
            name="shopeePrice"
            inputMode="decimal"
            defaultValue={initial.shopeePrice}
            placeholder="ex.: 18,62"
            error={e.shopeePrice}
          />
          <Campo
            label="Preço no Mercado Livre (R$)"
            name="mercadoLivrePrice"
            inputMode="decimal"
            defaultValue={initial.mercadoLivrePrice}
            placeholder="ex.: 21,90"
            error={e.mercadoLivrePrice}
          />
        </div>
      </Secao>

      <Secao titulo="Prazo">
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <label className="chip-variante flex cursor-pointer items-start gap-3 p-4" aria-checked={readyToShip}>
            <input
              type="checkbox"
              name="readyToShip"
              checked={readyToShip}
              onChange={(ev) => setReadyToShip(ev.target.checked)}
              className="mt-1 size-4 accent-tinta"
            />
            <span>
              <span className="block font-bold">Pronta entrega</span>
              <span className="mt-0.5 block text-sm text-tinta-suave">Tenho em estoque: sai em 1 dia útil.</span>
            </span>
          </label>
          <Campo
            label="Dias para produzir"
            name="productionDays"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            defaultValue={initial.productionDays}
            error={e.productionDays}
            hint={readyToShip ? "Usado só se você desmarcar a pronta entrega." : "Dias úteis até a peça ficar pronta."}
          />
        </div>
      </Secao>

      <Secao
        titulo="Frete"
        descricao="O frete embutido já está no preço e o cliente não vê. Ele só paga o que passar disso: se o frete real der R$ 14 e o embutido for R$ 10, aparece R$ 4; se der menos, aparece Frete grátis."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          <div className="col-span-2 sm:col-span-3">
            <label htmlFor="shippingCredit" className="rotulo mb-2 block">
              Frete embutido por unidade
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-tinta-suave">R$</span>
              <input
                id="shippingCredit"
                name="shippingCredit"
                inputMode="decimal"
                defaultValue={initial.shippingCredit}
                aria-invalid={e.shippingCredit ? true : undefined}
                className={`${inputClass} pl-11`}
              />
            </div>
            {e.shippingCredit && <p className="mt-1.5 text-sm font-medium text-erro">{e.shippingCredit}</p>}
          </div>
          <Campo
            className="col-span-2 sm:col-span-3"
            label="Peso com embalagem (g)"
            name="weightGrams"
            type="number"
            inputMode="numeric"
            defaultValue={initial.weightGrams}
            error={e.weightGrams}
          />
          <Campo className="sm:col-span-2" label="Altura da caixa (cm)" name="boxHeightCm" type="number" inputMode="numeric" defaultValue={initial.boxHeightCm} error={e.boxHeightCm} />
          <Campo className="sm:col-span-2" label="Largura (cm)" name="boxWidthCm" type="number" inputMode="numeric" defaultValue={initial.boxWidthCm} error={e.boxWidthCm} />
          <Campo className="col-span-2 sm:col-span-2" label="Comprimento (cm)" name="boxLengthCm" type="number" inputMode="numeric" defaultValue={initial.boxLengthCm} error={e.boxLengthCm} />
        </div>
        <p className="mt-3 text-xs text-tinta-suave">
          Peso e caixa vão para o Melhor Envio calcular o frete. Os Correios cobram no mínimo 16 × 11 × 2 cm.
        </p>
      </Secao>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-full bg-branco/90 p-2 pl-5 shadow-alto backdrop-blur">
        <div aria-live="polite" className="min-w-0 flex-1 text-sm">
          {state.error ? (
            <span className="font-medium text-erro">{state.error}</span>
          ) : state.ok ? (
            <span className="font-medium">{state.message}</span>
          ) : (
            <span className="text-tinta-suave">{initial.id ? "Alterações aparecem na loja ao salvar." : "Depois de criar, você adiciona fotos e o arquivo 3D."}</span>
          )}
        </div>
        <button type="submit" disabled={pending} className="botao-principal px-6 py-3 text-sm">
          {pending ? "Salvando…" : initial.id ? "Salvar alterações" : "Criar produto"}
        </button>
      </div>
    </form>
  );
}
