// Seed da Yumi Mix: 2 categorias e 7 produtos reais (fotos em public/produtos/<pasta>/main_images).
// Rodar: npm run db:seed  (idempotente: pode rodar de novo sem duplicar)

import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type VariantSeed = { key: string; name: string; material: string; colorHex: string; priceCents: number };
type ImageSeed = { url: string; alt: string };
type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  dimensions: string;
  productionDays: number;
  readyToShip: boolean;
  category: string;
  images: ImageSeed[];
  variants: VariantSeed[];
};

// ---------- categorias ----------
const categories = [
  { slug: "organizacao", name: "Organização" },
  { slug: "decoracao-sazonal", name: "Decoração sazonal" },
];

// ---------- catálogo ----------
const products: ProductSeed[] = [
  {
    slug: "kit-ganchos-adesivos-parede",
    name: "Kit 3 Ganchos Adesivos para Parede",
    description:
      "Três ganchos adesivos para toalhas, roupões ou utensílios. Cola na parede sem furar e já aguenta o uso do dia a dia.",
    dimensions: "6 × 6 × 4 cm (cada gancho)",
    productionDays: 2,
    readyToShip: true,
    category: "organizacao",
    images: [
      { url: "/produtos/kit_3_ganchos_adesivos_para_parede_tolhas_cabide_m/main_images/5.jpg", alt: "Ganchos adesivos no quarto, com jaqueta e bolsa pendurada" },
      { url: "/produtos/kit_3_ganchos_adesivos_para_parede_tolhas_cabide_m/main_images/6.jpg", alt: "Ganchos adesivos no banheiro e na cozinha, com toalhas" },
      { url: "/produtos/kit_3_ganchos_adesivos_para_parede_tolhas_cabide_m/main_images/7.jpg", alt: "Ganchos adesivos na entrada, com boné e bolsa" },
    ],
    variants: [{ key: "unico", name: "Padrão", material: "Plástico ABS", colorHex: "#f2f1ec", priceCents: 1990 }],
  },
  {
    slug: "kit-saboneteira-parede-2-ganchos",
    name: "Kit Saboneteira de Parede com 2 Ganchos",
    description:
      "Saboneteira com dreno para a água não empoçar, mais dois ganchos de apoio ao lado. Fixação adesiva, sem parafuso.",
    dimensions: "16 × 9 × 6 cm",
    productionDays: 2,
    readyToShip: true,
    category: "organizacao",
    images: [
      { url: "/produtos/kit_saboneteira_de_parede_2_ganchos_adesivo_sem_fu/main_images/8.jpg", alt: "Kit saboneteira de parede com 2 ganchos" },
      { url: "/produtos/kit_saboneteira_de_parede_2_ganchos_adesivo_sem_fu/main_images/2.jpg", alt: "Ganchos e saboneteira de parede instalados no banheiro" },
      { url: "/produtos/kit_saboneteira_de_parede_2_ganchos_adesivo_sem_fu/main_images/5.jpg", alt: "Detalhe da saboneteira de parede com água escoando" },
    ],
    variants: [{ key: "unico", name: "Padrão", material: "Plástico ABS", colorHex: "#f2f1ec", priceCents: 2790 }],
  },
  {
    slug: "kit-porta-copos-cafe",
    name: "Kit Suporte Porta-copos Descartáveis",
    description:
      "Organizador de copos descartáveis para o cantinho do café ou da água. Mantém a bancada livre e os copos sempre à mão.",
    dimensions: "9 × 9 × 23 cm",
    productionDays: 2,
    readyToShip: true,
    category: "organizacao",
    images: [
      { url: "/produtos/kit_suporte_porta_copos_descartaveis_para_cantinho/main_images/cinza.jpg", alt: "Suporte porta-copos descartáveis no cantinho do café" },
    ],
    variants: [
      { key: "branco", name: "Branco", material: "Plástico", colorHex: "#f2f1ec", priceCents: 2990 },
      { key: "cinza", name: "Cinza", material: "Plástico", colorHex: "#8c8c87", priceCents: 2990 },
      { key: "preto", name: "Preto", material: "Plástico", colorHex: "#2a2a2a", priceCents: 2990 },
    ],
  },
  {
    slug: "letreiro-feliz-natal",
    name: "Letreiro Feliz Natal Decorativo",
    description: "Letreiro \"Feliz Natal\" com floco de neve, pronto para a mesa, a estante ou o centro da sala nessa época do ano.",
    dimensions: "32 × 9 × 2 cm",
    productionDays: 2,
    readyToShip: true,
    category: "decoracao-sazonal",
    images: [
      { url: "/produtos/letreiro_feliz_natal_vermelho_decorativo_para_mesa/main_images/dourado.jpg", alt: "Letreiro Feliz Natal nas 4 cores disponíveis" },
      { url: "/produtos/letreiro_feliz_natal_vermelho_decorativo_para_mesa/main_images/6.jpg", alt: "Letreiro Feliz Natal branco sobre a mesa" },
      { url: "/produtos/letreiro_feliz_natal_vermelho_decorativo_para_mesa/main_images/vermelho.jpg", alt: "Letreiro Feliz Natal vermelho junto à árvore" },
    ],
    variants: [
      { key: "branco", name: "Branco", material: "MDF", colorHex: "#f2f1ec", priceCents: 3990 },
      { key: "dourado", name: "Dourado", material: "MDF", colorHex: "#c6a469", priceCents: 3990 },
      { key: "verde", name: "Verde", material: "MDF", colorHex: "#3f6b4a", priceCents: 3990 },
      { key: "vermelho", name: "Vermelho", material: "MDF", colorHex: "#b3261e", priceCents: 3990 },
    ],
  },
  {
    slug: "saboneteira-autodrenagem",
    name: "Saboneteira Minimalista com Autodrenagem",
    description: "Saboneteira com autodrenagem: a água escoa sozinha e o sabonete fica seco por mais tempo. Pia sempre organizada.",
    dimensions: "13 × 9 × 3 cm",
    productionDays: 2,
    readyToShip: true,
    category: "organizacao",
    images: [
      { url: "/produtos/saboneteira_minimalista_com_autodrenagem_para_pia_/main_images/7.jpg", alt: "Saboneteira minimalista na pia do banheiro" },
      { url: "/produtos/saboneteira_minimalista_com_autodrenagem_para_pia_/main_images/branco.jpg", alt: "Saboneteira minimalista ao lado da torneira" },
      { url: "/produtos/saboneteira_minimalista_com_autodrenagem_para_pia_/main_images/8.jpg", alt: "Mão segurando o sabonete sobre a saboneteira" },
    ],
    variants: [{ key: "branco", name: "Branco", material: "Silicone", colorHex: "#f2f1ec", priceCents: 2290 }],
  },
  {
    slug: "suporte-lavadora-alta-pressao",
    name: "Suporte de Parede para Lavadora de Alta Pressão",
    description:
      "Suporte de parede para guardar a lavadora de alta pressão (compatível com Electrolux, WAP e Vonder) fora do chão da área de serviço.",
    dimensions: "22 × 16 × 11 cm",
    productionDays: 2,
    readyToShip: true,
    category: "organizacao",
    images: [
      { url: "/produtos/suporte_parede_lavadora_alta_pressao_organizador_c/main_images/6.jpg", alt: "Lavadora de alta pressão pendurada no suporte de parede" },
      { url: "/produtos/suporte_parede_lavadora_alta_pressao_organizador_c/main_images/5.jpg", alt: "Medidas do suporte de parede para lavadora" },
      { url: "/produtos/suporte_parede_lavadora_alta_pressao_organizador_c/main_images/7.jpg", alt: "Lavadora de alta pressão guardada perto da máquina de lavar" },
    ],
    variants: [{ key: "unico", name: "Padrão", material: "Aço e plástico", colorHex: "#4a4a48", priceCents: 4990 }],
  },
  {
    slug: "suporte-saboneteira-autoadesiva",
    name: "Suporte Saboneteira de Parede Autoadesiva",
    description: "Suporte com dreno para porta-sabão, direto na parede do banheiro, cozinha ou lavanderia. Fixação adesiva, sem parafuso.",
    dimensions: "11 × 8 × 5 cm",
    productionDays: 2,
    readyToShip: true,
    category: "organizacao",
    images: [
      { url: "/produtos/suporte_saboneteira_parede_autoadesiva_porta_sabao/main_images/5.jpg", alt: "Suporte saboneteira instalado no box do chuveiro" },
      { url: "/produtos/suporte_saboneteira_parede_autoadesiva_porta_sabao/main_images/6.jpg", alt: "Suporte saboneteira na parede do banheiro" },
      { url: "/produtos/suporte_saboneteira_parede_autoadesiva_porta_sabao/main_images/preto.jpg", alt: "Suporte saboneteira preto ao lado da pia" },
    ],
    variants: [
      { key: "branco", name: "Branco", material: "Plástico", colorHex: "#f2f1ec", priceCents: 1790 },
      { key: "preto", name: "Preto", material: "Plástico", colorHex: "#2a2a2a", priceCents: 1790 },
    ],
  },
];

// vídeo do fornecedor fica ao lado das fotos: public/produtos/<pasta>/product_videos/1.mp4
function videoDaPasta(fotoUrl: string | undefined): string | null {
  if (!fotoUrl) return null;
  const url = fotoUrl.replace(/\/main_images\/[^/]+$/, "/product_videos/1.mp4");
  return url !== fotoUrl && existsSync(`public${url}`) ? url : null;
}

async function main() {
  // o catálogo agora é editado no admin: o seed só cria o que falta, nunca apaga nem sobrescreve
  const categoryIds = new Map<string, string>();
  for (const [index, c] of categories.entries()) {
    const found = await prisma.category.findUnique({ where: { slug: c.slug } });
    const category = found ?? (await prisma.category.create({ data: { ...c, position: index } }));
    categoryIds.set(c.slug, category.id);
  }

  let created = 0;
  for (const [index, p] of products.entries()) {
    if (await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true } })) continue;
    // IDs determinísticos nas variantes: carrinhos salvos no navegador continuam válidos
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        dimensions: p.dimensions,
        productionDays: p.productionDays,
        readyToShip: p.readyToShip,
        videoUrl: videoDaPasta(p.images[0]?.url),
        position: index,
        categoryId: categoryIds.get(p.category),
        images: { create: p.images.map((img, i) => ({ url: img.url, alt: img.alt, position: i })) },
        variants: {
          create: p.variants.map((v, vi) => ({
            id: `${p.slug}--${v.key}`,
            name: v.name,
            material: v.material,
            colorHex: v.colorHex,
            priceCents: v.priceCents,
            position: vi,
          })),
        },
      },
    });
    created++;
  }

  const count = await prisma.product.count();
  console.log(`Seed concluído: ${created} criados, ${count} produtos no total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
