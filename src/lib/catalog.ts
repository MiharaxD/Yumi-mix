import { prisma } from "@/lib/db";

export async function listProducts() {
  return prisma.product.findMany({
    where: { archived: false },
    orderBy: { position: "asc" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: true,
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, archived: false },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { position: "asc" },
    include: {
      products: {
        where: { archived: false },
        orderBy: { position: "asc" },
        include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { archived: false },
        orderBy: { position: "asc" },
        include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export function minPriceCents(variants: { priceCents: number }[]): number {
  return variants.reduce((min, v) => Math.min(min, v.priceCents), Infinity);
}

export function hasPriceRange(variants: { priceCents: number }[]): boolean {
  return new Set(variants.map((v) => v.priceCents)).size > 1;
}
