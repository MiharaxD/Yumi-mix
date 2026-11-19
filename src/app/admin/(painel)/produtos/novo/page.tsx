import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { IconeVoltar } from "@/components/Icones";
import { EMPTY_PRODUCT, ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NovoProdutoPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } });
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/produtos" className="inline-flex items-center gap-2 text-sm font-semibold text-tinta-suave hover:text-tinta">
        <IconeVoltar className="size-4" /> Produtos
      </Link>
      <h1 className="titulo mt-3 mb-6 text-3xl font-extrabold sm:text-4xl">Novo produto</h1>
      <ProductForm initial={{ ...EMPTY_PRODUCT, categoryId: categories[0]?.id ?? "" }} categories={categories} />
    </div>
  );
}
