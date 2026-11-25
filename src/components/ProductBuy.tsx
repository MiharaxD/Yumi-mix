"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ImagemPeca } from "@/components/ImagemPeca";
import { CamadasFotos, useFotoAtiva } from "@/components/FotosPeca";
import { formatBRL } from "@/lib/money";
import { IconePlay, IconeSeta } from "@/components/Icones";
import { SeloPrazo } from "@/components/Prazo";

type Variant = { id: string; name: string; material: string; colorHex: string; priceCents: number; imageUrl?: string | null };
type Img = { id: string; url: string; alt: string };

// foto da variação escolhida (clique) ou sob o mouse, mostrada por cima da galeria
type FotoVariante = { url: string; alt: string } | null;
const FotoVarianteCtx = createContext<{
  fixada: FotoVariante;
  hover: FotoVariante | undefined; // undefined = mouse fora das cores
  fixar: (f: FotoVariante) => void;
  pairar: (f: FotoVariante | undefined) => void;
} | null>(null);

export function FotoVarianteProvider({ children }: { children: ReactNode }) {
  const [fixada, fixar] = useState<FotoVariante>(null);
  const [hover, pairar] = useState<FotoVariante | undefined>(undefined);
  return <FotoVarianteCtx.Provider value={{ fixada, hover, fixar, pairar }}>{children}</FotoVarianteCtx.Provider>;
}

export function ProductGallery({
  images,
  name,
  video,
  fotosVariantes = [],
}: {
  images: Img[];
  name: string;
  video?: string | null;
  fotosVariantes?: { url: string; alt: string }[];
}) {
  const { atual, anterior, ir } = useFotoAtiva();
  const ctx = useContext(FotoVarianteCtx);
  const fotoVariante = ctx ? (ctx.hover !== undefined ? ctx.hover : ctx.fixada) : null;
  const toque = useRef<number | null>(null);
  const [vendoVideo, setVendoVideo] = useState(false);
  const total = images.length;
  // o vídeo entra como último item da galeria, depois das fotos
  const itens = total + (video ? 1 : 0);
  const selecionado = vendoVideo ? total : atual;

  function escolher(i: number) {
    ctx?.fixar(null); // miniatura clicada volta para as fotos da galeria
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
        {/* fotos das cores ficam montadas por cima e só ganham opacidade (sem piscar) */}
        {fotosVariantes.map((f) => (
          <span
            key={f.url}
            className={`absolute inset-0 z-[3] transition-opacity duration-300 ${fotoVariante?.url === f.url && !vendoVideo ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={fotoVariante?.url !== f.url}
          >
            <ImagemPeca src={f.url} alt={f.alt} sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 100vw" inteira={false} />
          </span>
        ))}
        {video && vendoVideo && (
          <video
            src={video}
            className="surgir absolute inset-0 z-[4] size-full bg-tinta object-contain"
            controls
            autoPlay
            muted
            loop
            playsInline
            aria-label={`Vídeo de ${name}`}
          />
        )}
        {itens > 1 && (
          <span className="pointer-events-none absolute top-3 right-3 z-[5] rounded-full bg-branco/95 px-2.5 py-1 text-xs font-semibold tabular-nums shadow-[0_2px_8px_-2px_rgb(23_24_28/0.18)] lg:hidden" aria-hidden>
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

function separarLinks(valor: string | null): string[] {
  return (valor ?? "").split(/\s+/).filter(Boolean);
}

// mesmo anúncio em vários links: cada clique abre o próximo (vez guardada no navegador)
type Marca = { fundo: string; texto: string; logo: string; logoLargura: number };
const MARCAS: Record<"ml" | "shopee", Marca> = {
  ml: { fundo: "#ffe600", texto: "#2d3277", logo: "/marcas/mercado-livre.png", logoLargura: 43 },
  shopee: { fundo: "#ed4c2d", texto: "#ffffff", logo: "/marcas/shopee.png", logoLargura: 26 },
};

function BotaoLoja({ nome, urls, marca }: { nome: string; urls: string[]; marca: Marca }) {
  const chave = `yumi-link:${urls[0]}`;
  const [vez, setVez] = useState(0);
  const href = urls[vez % urls.length];

  useEffect(() => {
    if (urls.length < 2) return;
    let salva: number;
    try {
      salva = Number(localStorage.getItem(chave));
    } catch {
      salva = NaN;
    }
    // primeira visita: começa num link sorteado para dividir os acessos
    // eslint-disable-next-line react-hooks/set-state-in-effect -- só lê o navegador depois da hidratação
    setVez(Number.isInteger(salva) && salva >= 0 ? salva : Math.floor(Math.random() * urls.length));
  }, [chave, urls.length]);

  function avancar() {
    if (urls.length < 2) return;
    const prox = (vez + 1) % urls.length;
    try {
      localStorage.setItem(chave, String(prox));
    } catch {}
    // troca depois do clique para o navegador abrir o link atual
    setTimeout(() => setVez(prox), 0);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={avancar}
      onAuxClick={avancar}
      className="botao-loja min-w-0 px-5 py-3 text-center"
      style={{ backgroundColor: marca.fundo, color: marca.texto }}
    >
      {/* logo recortado com o próprio fundo da marca, por isso some no botão */}
      {/* eslint-disable-next-line @next/next/no-img-element -- logo pequeno, sem otimização */}
      <img src={marca.logo} alt="" width={marca.logoLargura} height={28} className="h-7 w-auto shrink-0" />
      Comprar {nome}
      <IconeSeta className="size-4 shrink-0" />
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

export function ProductBuy({
  variants,
  readyToShip,
  productionDays,
  shopeeUrl,
  mercadoLivreUrl,
}: {
  variants: Variant[];
  readyToShip: boolean;
  productionDays: number;
  shopeeUrl: string | null;
  mercadoLivreUrl: string | null;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const ctx = useContext(FotoVarianteCtx);
  const fotoDe = (v: Variant): FotoVariante => (v.imageUrl ? { url: v.imageUrl, alt: `Cor ${v.name}` } : null);

  if (!variant) return <p className="text-tinta-suave">Esta peça está sem variantes no momento.</p>;

  const lojas = [
    { nome: "no Mercado Livre", urls: separarLinks(mercadoLivreUrl), marca: MARCAS.ml },
    { nome: "na Shopee", urls: separarLinks(shopeeUrl), marca: MARCAS.shopee },
  ].filter((l) => l.urls.length > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="titulo text-[2.25rem] leading-none sm:text-[2.5rem]" aria-live="polite">
          {formatBRL(variant.priceCents)}
          <span className="sr-only"> para a variante {variant.name}</span>
        </p>
        <SeloPrazo readyToShip={readyToShip} productionDays={productionDays} />
      </div>

      {variants.length > 1 && (
        <fieldset className="mt-6 min-w-0">
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
                    ctx?.fixar(fotoDe(v));
                  }}
                  onMouseEnter={() => ctx?.pairar(fotoDe(v))}
                  onMouseLeave={() => ctx?.pairar(undefined)}
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
      )}

      <div className="mt-7 mb-7">
        {lojas.length > 0 ? (
          <>
            <p className="rotulo mb-3">Onde comprar</p>
            <div className={`grid grid-cols-1 gap-2.5 ${lojas.length > 1 ? "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : ""}`}>
              {lojas.map((l) => (
                <BotaoLoja key={l.nome} nome={l.nome} urls={l.urls} marca={l.marca} />
              ))}
            </div>
            <p className="mt-3 text-sm text-tinta-suave">
              Você finaliza a compra, o pagamento e o frete na loja escolhida, com a proteção dela.
            </p>
          </>
        ) : (
          <p className="rounded-2xl bg-dourado-claro px-4 py-3 text-sm">
            Em breve na Shopee e no Mercado Livre.
          </p>
        )}
      </div>
    </div>
  );
}
