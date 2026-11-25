import Image from "next/image";
import Link from "next/link";
import { listProducts, listCategories, hasPriceRange, minPriceCents } from "@/lib/catalog";
import { ProductTile } from "@/components/ProductTile";
import { Destaques, type PecaResumo } from "@/components/Vitrine";
import { IconeCaminhao, IconeRelogio, IconeSeta } from "@/components/Icones";
import { diasUteis } from "@/components/Prazo";
import { READY_TO_SHIP_DAYS } from "@/config";

export const dynamic = "force-dynamic";

// foto de ambiente do hero: banheiro arrumado, sem texto do fornecedor por cima
const CENA_HERO = "/produtos/kit_saboneteira_de_parede_2_ganchos_adesivo_sem_fu/main_images/2.jpg";

// arte da campanha do topo (texto já embutido na imagem, no canto superior direito)
const BANNER_TOPO = "/banners/natal-organizada.webp";

const botaoClaro =
  "inline-flex items-center justify-center gap-2 rounded-full bg-branco px-6 py-3.5 text-[0.9375rem] font-semibold text-tinta shadow-[0_8px_24px_-10px_rgb(0_0_0/0.5)] transition-colors hover:bg-dourado-claro";

function paraPeca(p: {
  slug: string;
  name: string;
  images: { url: string; alt: string }[];
  variants: { priceCents: number; colorHex: string }[];
  readyToShip: boolean;
  productionDays: number;
  shopeeUrl: string | null;
  mercadoLivreUrl: string | null;
  shopeePriceCents: number | null;
  mercadoLivrePriceCents: number | null;
}): PecaResumo {
  return {
    slug: p.slug,
    name: p.name,
    images: p.images,
    fromPriceCents: minPriceCents(p.variants),
    priceRange: hasPriceRange(p.variants),
    readyToShip: p.readyToShip,
    productionDays: p.productionDays,
    colors: p.variants.map((v) => v.colorHex),
    shopeeUrl: p.shopeeUrl,
    mercadoLivreUrl: p.mercadoLivreUrl,
    shopeePriceCents: p.shopeePriceCents,
    mercadoLivrePriceCents: p.mercadoLivrePriceCents,
  };
}

export default async function HomePage() {
  const [products, categorias] = await Promise.all([listProducts(), listCategories()]);

  const pecas: PecaResumo[] = products.map(paraPeca);

  const colecoes = categorias.filter((c) => c.products.length > 0);

  const garantias = [
    { icone: IconeRelogio, titulo: "Pronta entrega", texto: `Sai em até ${diasUteis(READY_TO_SHIP_DAYS)} depois do pagamento.` },
    {
      icone: IconeCaminhao,
      titulo: "Entrega para todo o Brasil",
      texto: "Você compra pela Shopee ou pelo Mercado Livre, com pagamento, frete e rastreio por lá.",
    },
  ];

  return (
    <>
      {/* banner de campanha: a arte já traz o título, só o botão vai por cima */}
      <section className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 sm:pt-4" aria-label="Campanha de Natal">
        <div className="relative isolate aspect-[16/9] overflow-hidden rounded-[2rem] bg-tinta">
          <Image
            src={BANNER_TOPO}
            alt="Sua casa mais organizada para o Natal"
            fill
            priority
            sizes="(min-width: 1280px) 1232px, 100vw"
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-tinta/70 via-tinta/10 to-transparent" aria-hidden />
          <div className="absolute bottom-0 left-0 p-4 sm:p-10">
            <Link href="#pecas" className={`surgir ${botaoClaro} max-sm:px-4 max-sm:py-2.5 max-sm:text-sm`}>
              Ver produtos <IconeSeta className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* hero: cartão de ambiente + painel de destaques */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5" aria-labelledby="titulo-vitrine">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr] lg:gap-5">
          <div className="relative isolate min-h-[30rem] overflow-hidden rounded-[2rem] bg-tinta text-branco sm:min-h-[34rem] lg:min-h-[38rem]">
            <Image src={CENA_HERO} alt="" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="-z-10 object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta/90 via-tinta/40 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <h1 id="titulo-vitrine" className="surgir titulo text-[2.75rem] leading-[0.98] sm:text-[4.25rem]">
                Peças para
                <br />
                <span className="text-branco/75">a sua casa.</span>
              </h1>
              <p className="surgir mt-4 max-w-sm text-base leading-relaxed text-pretty text-branco/85 [--atraso:100ms] sm:text-lg">
                Organização e decoração em pronta entrega: sai em até {diasUteis(READY_TO_SHIP_DAYS)}, com entrega para todo o Brasil.
              </p>
              <div className="surgir mt-7 flex flex-wrap gap-3 [--atraso:200ms]">
                <Link href="#pecas" className={botaoClaro}>
                  Ver as peças <IconeSeta className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div id="destaques" className="painel flex min-w-0 scroll-mt-28 flex-col overflow-hidden">
            <div className="px-5 pt-6 pb-5 sm:px-7 sm:pt-8">
              <h2 className="titulo text-[1.75rem] leading-[1.05] sm:text-[2.125rem]">
                Destaques <span className="italico">do ateliê</span>
              </h2>
              <p className="mt-1.5 text-sm text-tinta-suave">Uma seleção para começar.</p>
            </div>
            {pecas.length > 0 ? (
              <Destaques pecas={pecas} />
            ) : (
              <p className="mx-5 mb-6 rounded-2xl bg-papel p-5 text-tinta-suave sm:mx-7">
                Nenhuma peça cadastrada ainda. Rode <code className="font-semibold">npm run db:seed</code> para carregar o
                catálogo de teste.
              </p>
            )}
          </div>
        </div>

        {/* garantias: prazo e frete visíveis antes de escolher */}
        <ul className="painel mt-4 grid gap-5 px-5 py-6 sm:mt-5 md:grid-cols-2 md:gap-6 sm:px-8 sm:py-7" aria-label="Como funciona a compra">
          {garantias.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-4 md:justify-center">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-dourado-claro text-tinta">
                <Icone className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{titulo}</span>
                <span className="mt-0.5 block text-sm leading-snug text-tinta-suave">{texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {colecoes.length > 0 && (
        <section id="pecas" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-16 pb-6 sm:px-6 sm:pt-24" aria-labelledby="titulo-pecas">
          <h2 id="titulo-pecas" className="titulo mb-10 text-[2.25rem] leading-[1.02] sm:mb-14 sm:text-[3.25rem]">
            Todas as peças. <span className="italico">Em pronta entrega.</span>
          </h2>

          <div className="flex flex-col gap-14 sm:gap-20">
            {colecoes.map((categoria) => (
              <div key={categoria.id}>
                <div className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
                  <h3 className="titulo text-[1.5rem] leading-tight sm:text-[1.875rem]">{categoria.name}</h3>
                  <Link href={`/categoria/${categoria.slug}`} className="botao-contorno shrink-0 px-4 py-2 text-sm">
                    Ver todas <IconeSeta className="size-4" />
                  </Link>
                </div>
                <ul className="grade grid-cols-2 lg:grid-cols-3" aria-label={categoria.name}>
                  {categoria.products.map((p, i) => (
                    <li key={p.slug}>
                      <ProductTile {...paraPeca(p)} priority={i < 2} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {colecoes.length > 0 && (
        <section id="colecoes" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-16 pb-6 sm:px-6 sm:pt-24" aria-labelledby="titulo-colecoes">
          <h2 id="titulo-colecoes" className="titulo mb-10 text-[2.25rem] leading-[1.02] sm:mb-14 sm:text-[3.25rem]">
            Coleções. <span className="italico">Por cômodo e ocasião.</span>
          </h2>
          <ul className={`grade grid-cols-1 ${colecoes.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`} aria-label="Coleções">
            {colecoes.map((categoria) => {
              const imagem = categoria.products[0]?.images[1] ?? categoria.products[0]?.images[0];
              return (
                <li key={categoria.id}>
                  <Link
                    href={`/categoria/${categoria.slug}`}
                    className="cartao group relative isolate block aspect-[4/3] overflow-hidden bg-tinta text-branco sm:aspect-[5/4]"
                  >
                    {imagem && (
                      <Image src={imagem.url} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="foto-viva -z-10 object-cover object-[center_85%]" />
                    )}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta/80 via-tinta/10 to-transparent" aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-7">
                      <span>
                        <span className="titulo block text-[1.75rem] leading-tight sm:text-[2rem]">{categoria.name}</span>
                        <span className="mt-1 block text-sm text-branco/75">
                          {categoria.products.length} {categoria.products.length === 1 ? "peça" : "peças"}
                        </span>
                      </span>
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-branco text-tinta transition-transform duration-300 ease-galeria group-hover:translate-x-1">
                        <IconeSeta className="size-5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
