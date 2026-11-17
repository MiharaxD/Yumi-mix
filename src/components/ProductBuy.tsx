"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart-store";
import { ImagemPeca } from "@/components/ImagemPeca";
import { formatBRL } from "@/lib/money";
import { MAX_QUANTITY_PER_ITEM } from "@/config";
import { QuantityStepper } from "@/components/QuantityStepper";
import { IconeCheck, IconeSeta } from "@/components/Icones";
import { SeloPrazo } from "@/components/Prazo";

type Variant = { id: string; name: string; material: string; colorHex: string; priceCents: number };
type Img = { id: string; url: string; alt: string };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  return (
    <div className="flex flex-col bg-branco">
      <div className="moldura aspect-square w-full lg:aspect-auto lg:flex-1 lg:min-h-[34rem]">
        {current && (
          <ImagemPeca
            key={current.id}
            src={current.url}
            alt={current.alt}
            sizes="(min-width: 1024px) 50vw, 100vw"
            inteira={active === 0}
            respiro="inset-[8%]"
            className="surgir"
            priority
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-3 border-t border-tinta" role="group" aria-label={`Fotos de ${name}`}>
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}: ${img.alt}`}
              aria-pressed={i === active}
              className={`group relative border-tinta not-last:border-r ${i === active ? "" : "opacity-60 hover:opacity-100"} transition-opacity`}
            >
              <span className="moldura block aspect-[4/3]">
                <ImagemPeca src={img.url} alt="" sizes="200px" inteira={i === 0} respiro="inset-[8%]" />
              </span>
              <span
                className={`absolute inset-x-0 bottom-0 h-[3px] bg-tinta transition-transform duration-300 ${i === active ? "scale-x-100" : "scale-x-0"}`}
                aria-hidden
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductBuy({
  variants,
  productName,
  readyToShip,
  productionDays,
}: {
  variants: Variant[];
  productName: string;
  readyToShip: boolean;
  productionDays: number;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState<string | null>(null);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];

  if (!variant) return <p className="text-tinta-suave">Esta peça está sem variantes à venda no momento.</p>;

  function onAdd() {
    addToCart(variant.id, quantity);
    setAdded(`${quantity} × ${productName} (${variant.name}) no carrinho.`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="titulo text-[2.25rem] leading-none" aria-live="polite">
          {formatBRL(variant.priceCents)}
          <span className="sr-only"> para a variante {variant.name}</span>
        </p>
        <SeloPrazo readyToShip={readyToShip} productionDays={productionDays} />
      </div>

      <fieldset className="mt-6">
        <legend className="rotulo">
          Cor e material:{" "}
          <span className="font-normal tracking-normal text-tinta-suave normal-case">
            {variant.name}, {variant.material}
          </span>
        </legend>
        <div role="radiogroup" aria-label="Variante" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {variants.map((v) => {
            const checked = v.id === variant.id;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => {
                  setVariantId(v.id);
                  setAdded(null);
                }}
                className={`chip-variante flex items-center gap-3 px-3 py-2.5 text-left text-sm ${checked ? "font-semibold" : ""}`}
              >
                <span
                  className="size-6 shrink-0 rounded-full ring-1 ring-tinta/20"
                  style={{ backgroundColor: v.colorHex }}
                  aria-hidden
                />
                <span className="leading-tight">
                  {v.name}
                  <span className="block text-xs font-normal text-tinta-suave">
                    {v.material} · {formatBRL(v.priceCents)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          max={MAX_QUANTITY_PER_ITEM}
          label="Quantidade"
          onChange={(n) => {
            setQuantity(Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, n)));
            setAdded(null);
          }}
        />
        <button
          type="button"
          onClick={onAdd}
          className="botao-principal flex-1 self-stretch px-5 py-3.5 whitespace-nowrap"
        >
          Adicionar ao carrinho <IconeSeta className="size-4" />
        </button>
      </div>

      <div aria-live="polite" className="min-h-14">
        {added && (
          <p className="surgir mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border border-tinta bg-branco px-4 py-3 text-sm">
            <IconeCheck className="size-5" />
            <span>{added}</span>
            <Link href="/carrinho" className="ml-auto inline-flex items-center gap-1 font-semibold underline">
              Ver carrinho <IconeSeta className="size-4" />
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
