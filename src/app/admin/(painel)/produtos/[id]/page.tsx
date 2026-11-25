import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { centsToInput } from "@/lib/money";
import { printFilePath } from "@/lib/print-files";
import { IconeSeta, IconeVoltar } from "@/components/Icones";
import { ProductForm } from "../ProductForm";
import { PrintFileCard, ProductDanger, ProductPhotos } from "../ProductMedia";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditarProdutoPage(props: PageProps<"/admin/produtos/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: [{ position: "asc" }, { id: "asc" }] }, variants: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/produtos" className="inline-flex items-center gap-2 text-sm font-semibold text-tinta-suave hover:text-tinta">
        <IconeVoltar className="size-4" /> Produtos
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
        {!product.archived && (
          <Link href={`/produto/${product.slug}`} target="_blank" className="botao-contorno px-4 py-2.5 text-sm">
            Ver na loja <IconeSeta className="size-4" />
          </Link>
        )}
      </div>

      {sp.novo === "1" && (
        <p className="surgir mb-6 rounded-2xl bg-dourado-claro px-4 py-3 text-sm font-medium" role="status">
          Produto criado. Agora adicione as fotos e o arquivo 3D.
        </p>
      )}
      {product.archived && (
        <p className="mb-6 rounded-2xl bg-nevoa px-4 py-3 text-sm font-medium" role="status">
          Este produto está arquivado: não aparece na loja.
        </p>
      )}

      <div className="flex flex-col gap-6">
        <ProductPhotos
          productId={product.id}
          images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
          videoUrl={product.videoUrl}
        />
        <PrintFileCard
          productId={product.id}
          file={
            product.printFilePath && product.printFileName
              ? {
                  name: product.printFileName,
                  bytes: product.printFileBytes ?? 0,
                  downloadPath: printFilePath(product.id, product.printFileName),
                }
              : null
          }
        />
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            name: product.name,
            description: product.description,
            dimensions: product.dimensions,
            categoryId: product.categoryId ?? "",
            readyToShip: product.readyToShip,
            productionDays: product.productionDays,
            shopeeUrl: product.shopeeUrl ?? "",
            mercadoLivreUrl: product.mercadoLivreUrl ?? "",
            shopeePrice: product.shopeePriceCents != null ? centsToInput(product.shopeePriceCents) : "",
            mercadoLivrePrice: product.mercadoLivrePriceCents != null ? centsToInput(product.mercadoLivrePriceCents) : "",
            shippingCredit: centsToInput(product.shippingCreditCents),
            weightGrams: product.weightGrams,
            boxHeightCm: product.boxHeightCm,
            boxWidthCm: product.boxWidthCm,
            boxLengthCm: product.boxLengthCm,
            variants: product.variants.map((v) => ({
              key: v.id,
              id: v.id,
              name: v.name,
              material: v.material,
              colorHex: v.colorHex,
              price: centsToInput(v.priceCents),
            })),
          }}
        />
        <ProductDanger productId={product.id} archived={product.archived} />
      </div>
    </div>
  );
}
