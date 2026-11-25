// Grava os links e preços de prisma/links-lojas.json nos produtos que já existem: `node prisma/links-lojas.mts`.
// Só preenche campos vazios (não sobrescreve o que foi editado no admin). O seed usa o mesmo JSON.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

type Links = Record<string, { shopeeUrl?: string; mercadoLivreUrl?: string; shopeePriceCents?: number; mercadoLivrePriceCents?: number }>;
const linksLojas: Links = JSON.parse(readFileSync(new URL("./links-lojas.json", import.meta.url), "utf8"));

const prisma = new PrismaClient();
for (const [slug, links] of Object.entries(linksLojas)) {
  const p = await prisma.product.findUnique({ where: { slug }, select: { id: true, shopeeUrl: true, mercadoLivreUrl: true, shopeePriceCents: true, mercadoLivrePriceCents: true } });
  if (!p) {
    console.log(`sem produto: ${slug}`);
    continue;
  }
  const data = {
    ...(links.shopeeUrl && !p.shopeeUrl ? { shopeeUrl: links.shopeeUrl } : {}),
    ...(links.mercadoLivreUrl && !p.mercadoLivreUrl ? { mercadoLivreUrl: links.mercadoLivreUrl } : {}),
    ...(links.shopeePriceCents && p.shopeePriceCents == null ? { shopeePriceCents: links.shopeePriceCents } : {}),
    ...(links.mercadoLivrePriceCents && p.mercadoLivrePriceCents == null ? { mercadoLivrePriceCents: links.mercadoLivrePriceCents } : {}),
  };
  if (Object.keys(data).length) await prisma.product.update({ where: { id: p.id }, data });
  console.log(`${slug}: ${Object.keys(data).join(", ") || "já tinha links"}`);
}
await prisma.$disconnect();
