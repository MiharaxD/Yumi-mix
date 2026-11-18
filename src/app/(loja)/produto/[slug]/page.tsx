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
    <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
      <nav aria-label="Trilha" className="py-3 sm:py-4">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-tinta-suave">
          <li>
            <Link href="/" className="link-linha hover:text-tinta">
              Início
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/#pecas" className="link-linha hover:text-tinta">
              Peças
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="font-medium text-tinta" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
        {/* no desktop a foto acompanha a rolagem enquanto você lê a ficha */}
        <div className="painel p-2.5 lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            name={product.name}
            images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
            video={product.videoUrl}
          />
        </div>

        <div className="painel px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-11">
          <h1 className="surgir titulo text-[2rem] leading-[1.05] sm:text-[2.75rem]">{product.name}</h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-tinta-suave sm:text-[1.0625rem]">{product.description}</p>

          <div className="mt-7">
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

          <dl className="mt-2 flex flex-col gap-1.5 text-sm">
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
              <div key={termo} className="grid grid-cols-[6rem_1fr] gap-4 rounded-2xl bg-papel px-4 py-3.5">
                <dt className="rotulo">{termo}</dt>
                <dd className="text-tinta-suave">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
