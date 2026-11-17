import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { ProductBuy, ProductGallery } from "@/components/ProductBuy";
import { diasUteis } from "@/components/Prazo";
import { READY_TO_SHIP_DAYS } from "@/config";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Peça não encontrada" };
}

export default async function ProductPage(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const materials = [...new Set(product.variants.map((v) => v.material))].join(", ");

  return (
    <div className="mx-auto max-w-7xl pb-16 sm:px-6 sm:pb-24">
      <nav aria-label="Trilha" className="px-4 py-4 sm:px-0 sm:py-5">
        <ol className="flex flex-wrap items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-tinta-suave uppercase">
          <li>
            <Link href="/" className="link-linha hover:text-tinta">
              Início
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/#pecas" className="link-linha hover:text-tinta">
              Peças
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-tinta" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 border-y border-tinta sm:border-x lg:grid-cols-[1.1fr_1fr]">
        <ProductGallery
          name={product.name}
          images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
        />

        <div className="border-t border-tinta bg-papel px-4 py-8 sm:px-8 sm:py-10 lg:border-t-0 lg:border-l lg:px-12 lg:py-12">
          <h1 className="surgir leading-[0.92]">
            <span className="titulo block text-[2.75rem] sm:text-[4rem]">{product.name}</span>
            <span className="italico mt-1 block text-xl text-tinta-suave sm:text-2xl">impressa em 3D, acabada à mão</span>
          </h1>
          <p className="mt-6 max-w-prose text-base leading-relaxed text-tinta-suave sm:text-lg">{product.description}</p>

          <div className="mt-8 border-t border-tinta pt-8">
            <ProductBuy
              productName={product.name}
              readyToShip={product.readyToShip}
              productionDays={product.productionDays}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                material: v.material,
                colorHex: v.colorHex,
                priceCents: v.priceCents,
              }))}
            />
          </div>

          <dl className="mt-4 border-t border-tinta text-sm">
            {[
              ["Medidas", product.dimensions],
              ["Material", materials],
              [
                "Prazo",
                product.readyToShip
                  ? `Pronta entrega: sai em até ${diasUteis(READY_TO_SHIP_DAYS)}.`
                  : `Produzida depois do pedido: fica pronta em até ${diasUteis(product.productionDays)}.`,
              ],
            ].map(([termo, valor]) => (
              <div key={termo} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-tinta/20 py-3.5">
                <dt className="rotulo pt-0.5">{termo}</dt>
                <dd className="text-tinta-suave">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
