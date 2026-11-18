"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { addToCart } from "@/lib/cart-store";
import { ImagemPeca } from "@/components/ImagemPeca";
import { CamadasFotos, useFotoAtiva } from "@/components/FotosPeca";
import { formatBRL } from "@/lib/money";
import { MAX_QUANTITY_PER_ITEM } from "@/config";
import { QuantityStepper } from "@/components/QuantityStepper";
import { IconeCheck, IconePlay, IconeSeta } from "@/components/Icones";
import { SeloPrazo } from "@/components/Prazo";

type Variant = { id: string; name: string; material: string; colorHex: string; priceCents: number };
type Img = { id: string; url: string; alt: string };

export function ProductGallery({ images, name, video }: { images: Img[]; name: string; video?: string | null }) {
  const { atual, anterior, ir } = useFotoAtiva();
  const toque = useRef<number | null>(null);
  const [vendoVideo, setVendoVideo] = useState(false);
  const total = images.length;
  // o vídeo entra como último item da galeria, depois das fotos
  const itens = total + (video ? 1 : 0);
  const selecionado = vendoVideo ? total : atual;

  function escolher(i: number) {
    if (video && i === total) return setVendoVideo(true);
    setVendoVideo(false);
    ir(i);
  }

  function passar(direcao: 1 | -1) {
    escolher((selecionado + direcao + itens) % itens);
  }

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row-reverse lg:gap-3">
      <div
        className="moldura aspect-square w-full touch-pan-y select-none rounded-[1.5rem] lg:flex-1"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") toque.current = e.clientX;
        }}
        onPointerUp={(e) => {
          // arrastar o dedo para os lados troca a foto
          if (toque.current === null || itens < 2) return;
          const dx = e.clientX - toque.current;
          toque.current = null;
          if (Math.abs(dx) > 40) passar(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => (toque.current = null)}
      >
        <CamadasFotos fotos={images} sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 100vw" atual={atual} anterior={anterior} priority />
        {video && vendoVideo && (
          <video
            src={video}
            className="surgir absolute inset-0 z-[2] size-full bg-tinta object-contain"
            controls
            autoPlay
            muted
            loop
            playsInline
            aria-label={`Vídeo de ${name}`}
          />
        )}
        {itens > 1 && (
          <span className="pointer-events-none absolute top-3 right-3 z-[3] rounded-full bg-branco/95 px-2.5 py-1 text-xs font-semibold tabular-nums shadow-[0_2px_8px_-2px_rgb(23_24_28/0.18)] lg:hidden" aria-hidden>
            {selecionado + 1} / {itens}
          </span>
        )}
      </div>
      {itens > 1 && (
        <div
          className="grid gap-2 lg:flex lg:w-20 lg:shrink-0 lg:flex-col"
          style={{ gridTemplateColumns: `repeat(${itens}, minmax(0, 1fr))` }}
          role="group"
          aria-label={`Fotos e vídeo de ${name}`}
          onKeyDown={(e) => {
            const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!passo) return;
            e.preventDefault();
            const prox = (selecionado + passo + itens) % itens;
            escolher(prox);
            (e.currentTarget.children[prox] as HTMLElement | undefined)?.focus();
          }}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => escolher(i)}
              aria-label={`Ver foto ${i + 1}: ${img.alt}`}
              aria-pressed={i === selecionado}
              className={`group relative rounded-[0.875rem] transition-[opacity,box-shadow] duration-300 ${i === selecionado ? "shadow-[0_0_0_2px_var(--color-tinta)]" : "opacity-60 hover:opacity-100"}`}
            >
              <span className="moldura block aspect-[4/3] rounded-[0.875rem] lg:aspect-square">
                <ImagemPeca src={img.url} alt="" sizes="(min-width: 1024px) 96px, 34vw" inteira={false} />
              </span>
            </button>
          ))}
          {video && (
            <button
              type="button"
              onClick={() => escolher(total)}
              aria-label="Ver vídeo da peça"
              aria-pressed={vendoVideo}
              className={`group relative rounded-[0.875rem] transition-[opacity,box-shadow] duration-300 ${vendoVideo ? "shadow-[0_0_0_2px_var(--color-tinta)]" : "opacity-80 hover:opacity-100"}`}
            >
              <span className="moldura block aspect-[4/3] rounded-[0.875rem] lg:aspect-square">
                {images[0] && <ImagemPeca src={images[0].url} alt="" sizes="(min-width: 1024px) 96px, 34vw" inteira={false} />}
                <span className="absolute inset-0 z-[2] grid place-items-center bg-tinta/35">
                  <span className="grid size-8 place-items-center rounded-full bg-branco text-tinta shadow-[0_4px_12px_-4px_rgb(0_0_0/0.4)]">
                    <IconePlay className="size-4 translate-x-px" />
                  </span>
                </span>
              </span>
            </button>
          )}
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
        <p className="titulo text-[2.25rem] leading-none sm:text-[2.5rem]" aria-live="polite">
          {formatBRL(variant.priceCents)}
          <span className="sr-only"> para a variante {variant.name}</span>
        </p>
        <SeloPrazo readyToShip={readyToShip} productionDays={productionDays} />
      </div>

      <fieldset className="mt-6">
        <legend className="rotulo">
          Cor e material:{" "}
          <span className="font-normal text-tinta-suave">
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
                className={`chip-variante flex items-center gap-3 px-3.5 py-3 text-left text-sm ${checked ? "font-semibold" : ""}`}
              >
                <span
                  className="size-7 shrink-0 rounded-full ring-1 ring-tinta/15 ring-inset"
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
          className="botao-principal flex-1 self-stretch px-6 py-3.5 whitespace-nowrap"
        >
          Adicionar ao carrinho <IconeSeta className="size-4" />
        </button>
      </div>

      <div aria-live="polite" className="min-h-14">
        {added && (
          <p className="surgir mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-dourado-claro px-4 py-3 text-sm">
            <span className="grid size-7 place-items-center rounded-full bg-tinta text-branco">
              <IconeCheck className="check-desenha size-4" />
            </span>
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
