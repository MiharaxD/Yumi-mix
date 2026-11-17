import { prisma } from "@/lib/db";

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { position: "asc" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
}

export function minPriceCents(variants: { priceCents: number }[]): number {
  return variants.reduce((min, v) => Math.min(min, v.priceCents), Infinity);
}

export function hasPriceRange(variants: { priceCents: number }[]): boolean {
  return new Set(variants.map((v) => v.priceCents)).size > 1;
}
