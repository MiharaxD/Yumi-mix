import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, hasPriceRange, minPriceCents } from "@/lib/catalog";
import { ProductTile } from "@/components/ProductTile";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const categoria = await getCategoryBySlug(slug);
  return { title: categoria?.name ?? "Categoria não encontrada" };
}

export default async function CategoryPage(props: PageProps<"/categoria/[slug]">) {
  const { slug } = await props.params;
  const categoria = await getCategoryBySlug(slug);
  if (!categoria) notFound();

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
          <li className="font-medium text-tinta" aria-current="page">
            {categoria.name}
          </li>
        </ol>
      </nav>

      <h1 className="titulo pt-2 pb-8 text-[2.25rem] leading-[1.02] sm:pb-10 sm:text-[3.25rem]">
        {categoria.name}.{" "}
        <span className="italico">
          {categoria.products.length} {categoria.products.length === 1 ? "peça" : "peças"}.
        </span>
      </h1>

      {categoria.products.length > 0 ? (
        <ul className="grade grid-cols-2 lg:grid-cols-3" aria-label={categoria.name}>
          {categoria.products.map((p, i) => (
            <li key={p.slug}>
              <ProductTile
                slug={p.slug}
                name={p.name}
                images={p.images}
                fromPriceCents={minPriceCents(p.variants)}
                priceRange={hasPriceRange(p.variants)}
                readyToShip={p.readyToShip}
                productionDays={p.productionDays}
                colors={p.variants.map((v) => v.colorHex)}
                shopeeUrl={p.shopeeUrl}
                mercadoLivreUrl={p.mercadoLivreUrl}
                shopeePriceCents={p.shopeePriceCents}
                mercadoLivrePriceCents={p.mercadoLivrePriceCents}
                priority={i < 2}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="painel p-6 text-tinta-suave">
          Nenhuma peça nesta categoria ainda.
        </p>
      )}
    </div>
  );
}
