import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { minPriceCents, hasPriceRange } from "@/lib/catalog";
import { IconeCubo, IconeMais } from "@/components/Icones";
import { PageTitle } from "../ui";

export const metadata: Metadata = { title: "Produtos" };

export default async function AdminProdutosPage(props: PageProps<"/admin/produtos">) {
  const sp = await props.searchParams;
  const verArquivados = sp.ver === "arquivados";
  const [products, counts] = await Promise.all([
    prisma.product.findMany({
      where: { archived: verArquivados },
      orderBy: [{ category: { position: "asc" } }, { position: "asc" }],
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { select: { priceCents: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.groupBy({ by: ["archived"], _count: { _all: true } }),
  ]);
  const count = (a: boolean) => counts.find((c) => c.archived === a)?._count._all ?? 0;

  return (
    <>
      <PageTitle
        aside={
          <Link href="/admin/produtos/novo" className="botao-principal px-5 py-3 text-sm">
            <IconeMais className="size-4" /> Novo produto
          </Link>
        }
      >
        Produtos
      </PageTitle>

      {sp.excluido === "1" && (
        <p className="mb-5 rounded-2xl bg-dourado-claro px-4 py-3 text-sm font-medium" role="status">
          Produto excluído.
        </p>
      )}

      <nav aria-label="Filtrar produtos" className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto pb-1">
        <Link href="/admin/produtos" aria-current={!verArquivados ? "page" : undefined} className="pilula bg-branco">
          Na loja <span className="opacity-70">{count(false)}</span>
        </Link>
        <Link
          href="/admin/produtos?ver=arquivados"
          aria-current={verArquivados ? "page" : undefined}
          className="pilula bg-branco"
        >
          Arquivados <span className="opacity-70">{count(true)}</span>
        </Link>
      </nav>

      {products.length === 0 ? (
        <div className="painel px-6 py-10 text-center">
          <p className="font-semibold">{verArquivados ? "Nenhum produto arquivado." : "Nenhum produto na loja ainda."}</p>
          {!verArquivados && (
            <Link href="/admin/produtos/novo" className="botao-principal mt-5 px-5 py-3 text-sm">
              <IconeMais className="size-4" /> Cadastrar o primeiro
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const capa = p.images[0];
            const preco = p.variants.length
              ? `${hasPriceRange(p.variants) ? "a partir de " : ""}${formatBRL(minPriceCents(p.variants))}`
              : "sem preço";
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="cartao group flex h-full gap-4 p-3 transition-transform hover:-translate-y-0.5"
                >
                  <span className="moldura relative size-24 shrink-0 overflow-hidden rounded-foto">
                    {capa ? (
                      <Image src={capa.url} alt="" fill sizes="96px" className="object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-xs text-tinta-suave">sem foto</span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-1">
                    <span className="truncate font-bold group-hover:underline">{p.name}</span>
                    <span className="text-sm text-tinta-suave">
                      {p.category?.name ?? "Sem categoria"} · {p.variants.length}{" "}
                      {p.variants.length === 1 ? "variação" : "variações"}
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">{preco}</span>
                      {p.printFilePath ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-nevoa px-2 py-0.5 text-xs font-semibold">
                          <IconeCubo className="size-3.5" /> .3mf
                        </span>
                      ) : (
                        <span className="rounded-full bg-erro-fundo px-2 py-0.5 text-xs font-semibold text-erro">sem .3mf</span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
