import Image from "next/image";
import Link from "next/link";
import { listProducts, hasPriceRange, minPriceCents } from "@/lib/catalog";
import { ProductTile } from "@/components/ProductTile";
import { Destaques, ListaPecas, type PecaResumo } from "@/components/Vitrine";
import { IconeSeta } from "@/components/Icones";

export const dynamic = "force-dynamic";

const PASSOS = ["Você manda foto e medidas", "A gente responde com orçamento", "Imprimimos e acabamos à mão"];

export default async function HomePage() {
  const products = await listProducts();

  const pecas: PecaResumo[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    imageUrl: p.images[0]?.url ?? null,
    imageAlt: p.images[0]?.alt ?? p.name,
    fromPriceCents: minPriceCents(p.variants),
    priceRange: hasPriceRange(p.variants),
    readyToShip: p.readyToShip,
    productionDays: p.productionDays,
    colors: p.variants.map((v) => v.colorHex),
  }));
  // a foto de ambiente da primeira peça vira a "sala" do hero
  const cena = products[0]?.images[1] ?? products[0]?.images[0];

  return (
    <>
      {/* hero dividido: ambiente à esquerda, destaques à direita */}
      <section className="border-b border-tinta" aria-labelledby="titulo-vitrine">
        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:px-6 lg:grid-cols-2">
          <div className="relative min-h-[26rem] overflow-hidden bg-tinta text-branco sm:border-x sm:border-tinta lg:min-h-[36rem]">
            {cena && (
              <Image src={cena.url} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" unoptimized />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-tinta/90 via-tinta/45 to-tinta/5" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <h1 id="titulo-vitrine" className="surgir leading-[0.9]">
                <span className="titulo block text-[3.25rem] sm:text-[5rem]">Peças para</span>
                <span className="italico block text-[2.6rem] leading-[1.05] sm:text-[4rem]">a sua casa</span>
              </h1>
              <p className="surgir mt-4 max-w-sm text-sm leading-relaxed text-branco/85 [--atraso:120ms] sm:text-base">
                Decoração impressa em 3D, camada por camada, no nosso ateliê.
              </p>
              <Link
                href="#pecas"
                className="surgir mt-6 inline-flex items-center gap-3 bg-branco px-4 py-2.5 text-[0.6875rem] font-bold tracking-[0.1em] text-tinta uppercase transition-colors [--atraso:220ms] hover:bg-tinta hover:text-branco"
              >
                Ver as peças <IconeSeta className="size-4" />
              </Link>
            </div>
          </div>

          <div id="destaques" className="flex min-w-0 scroll-mt-24 flex-col bg-papel sm:border-r sm:border-tinta lg:border-l-0">
            <h2 className="titulo px-5 pt-8 pb-6 text-[2rem] leading-[0.95] sm:px-8 sm:pt-10 sm:text-[2.5rem]">
              Destaques
              <br />
              do ateliê
            </h2>
            {pecas.length > 0 ? (
              <div className="flex flex-1 flex-col">
                <Destaques pecas={pecas} />
              </div>
            ) : (
              <p className="mx-5 mb-8 border border-tinta bg-branco p-6 text-tinta-suave sm:mx-8">
                Nenhuma peça cadastrada ainda. Rode <code className="font-semibold">npm run db:seed</code> para carregar o
                catálogo de teste.
              </p>
            )}
          </div>
        </div>
      </section>

      {pecas.length > 0 && (
        <>
          <section id="pecas" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 pb-16 sm:px-6 sm:pt-24" aria-labelledby="titulo-pecas">
            <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
              <h2 id="titulo-pecas" className="leading-[0.95]">
                <span className="titulo block text-[2.5rem] sm:text-[3.5rem]">Todas as peças</span>
                <span className="italico block text-[1.75rem] sm:text-[2.5rem]">feitas aqui</span>
              </h2>
              <p className="rotulo hidden text-tinta-suave sm:block">
                {pecas.length} {pecas.length === 1 ? "peça" : "peças"}
              </p>
            </div>
            <ul className="grade grid-cols-2 lg:grid-cols-3" aria-label="Peças à venda">
              {pecas.map((p, i) => (
                <li key={p.slug}>
                  <ProductTile {...p} priority={i < 2} />
                </li>
              ))}
            </ul>
          </section>

          <section className="pb-16 sm:pb-24" aria-labelledby="titulo-lista">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 id="titulo-lista" className="mb-8 leading-[0.95] sm:mb-10">
                <span className="titulo block text-[2.5rem] sm:text-[3.5rem]">Escolha pelo nome</span>
                <span className="italico block text-[1.75rem] sm:text-[2.5rem]">e veja de perto</span>
              </h2>
              <ListaPecas pecas={pecas} />
            </div>
          </section>
        </>
      )}

      <section className="border-t border-tinta bg-branco" aria-labelledby="titulo-sob-medida">
        <div className="mx-auto grid max-w-7xl sm:px-6 md:grid-cols-[1.2fr_1fr]">
          <div className="px-4 py-14 sm:px-0 sm:py-20 md:border-r md:border-tinta md:pr-12">
            <h2 id="titulo-sob-medida" className="leading-[0.95]">
              <span className="titulo block text-[2.5rem] sm:text-[3.75rem]">Não achou a peça</span>
              <span className="italico block text-[1.9rem] sm:text-[2.75rem]">que imaginou?</span>
            </h2>
            <p className="mt-6 max-w-prose text-base leading-relaxed text-tinta-suave sm:text-lg">
              Manda uma foto ou um rabisco, conta as medidas e a cor. A gente estuda a impressão e responde com o
              orçamento e o prazo.
            </p>
          </div>
          <ol className="flex flex-col border-t border-tinta md:border-t-0">
            {PASSOS.map((passo, i) => (
              <li key={passo} className="flex items-baseline gap-5 border-b border-tinta px-4 py-5 sm:px-8">
                <span className="titulo text-2xl text-tinta-suave">0{i + 1}</span>
                <span className="text-base font-semibold">{passo}</span>
              </li>
            ))}
            <li className="flex flex-1 items-end px-4 py-6 sm:px-8">
              <Link href="/personalizado" className="botao-principal w-full px-6 py-4 sm:w-auto">
                Pedir uma peça sob medida <IconeSeta className="size-4" />
              </Link>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
