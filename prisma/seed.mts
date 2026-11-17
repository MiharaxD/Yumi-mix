// Seed da Yumi Mix: 6 produtos fictícios de decoração impressa em 3D,
// cada um com 3 imagens SVG geradas localmente em public/produtos.
// Rodar: npm run db:seed  (idempotente: pode rodar de novo sem duplicar)

import { PrismaClient } from "@prisma/client";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type VariantSeed = { key: string; name: string; material: string; colorHex: string; priceCents: number };
type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  dimensions: string;
  productionDays: number;
  readyToShip: boolean;
  draw: (color: string) => { shapes: string; details: string };
  variants: VariantSeed[];
};

// ---------- utilidades de cor ----------
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount * (amount < 0 ? v : 255 - v))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ---------- desenhos das peças (viewBox 400x400, base em y≈330) ----------
const draws: Record<string, ProductSeed["draw"]> = {
  vaso: (c) => ({
    shapes: `<path d="M150 330 C138 300 166 272 150 240 C134 208 172 190 165 160 C158 130 176 112 170 92 L230 92 C224 112 242 130 235 160 C228 190 266 208 250 240 C234 272 262 300 250 330 Z"/>`,
    details: `<ellipse cx="200" cy="92" rx="30" ry="7" fill="${shade(c, -0.35)}"/>
      <path d="M200 92 C206 130 196 170 212 210 C226 250 210 290 222 330 L250 330 C262 300 234 272 250 240 C266 208 228 190 235 160 C242 130 224 112 230 92 Z" fill="${shade(c, -0.12)}"/>`,
  }),
  luminaria: (c) => {
    let holes = "";
    for (let row = 0; row < 6; row++)
      for (let col = 0; col < 3; col++)
        holes += `<circle cx="${172 + col * 28}" cy="${150 + row * 30}" r="9" fill="#ffd27a"/>`;
    return {
      shapes: `<rect x="150" y="118" width="100" height="212" rx="14"/>`,
      details: `<rect x="200" y="118" width="50" height="212" rx="0" fill="${shade(c, -0.1)}" opacity=".7"/>
        <rect x="146" y="110" width="108" height="16" rx="6" fill="${shade(c, -0.3)}"/>
        ${holes}
        <ellipse cx="200" cy="330" rx="70" ry="10" fill="#ffd27a" opacity=".25"/>`,
    };
  },
  cachepo: (c) => ({
    shapes: `<polygon points="140,182 200,166 260,182 250,330 200,342 150,330"/>`,
    details: `<polygon points="200,166 260,182 250,330 200,342" fill="${shade(c, -0.18)}"/>
      <polygon points="140,182 200,166 260,182 200,196" fill="${shade(c, -0.35)}"/>
      <g fill="#4f7d4a">
        <ellipse cx="178" cy="140" rx="14" ry="44" transform="rotate(-28 178 140)"/>
        <ellipse cx="222" cy="134" rx="14" ry="48" transform="rotate(24 222 134)"/>
        <ellipse cx="200" cy="120" rx="12" ry="54"/>
      </g>
      <g fill="#3c6338"><ellipse cx="200" cy="120" rx="4" ry="50"/></g>`,
  }),
  incenso: (c) => ({
    shapes: `<path d="M84 302 C150 240 284 240 334 290 C284 334 150 342 84 302 Z"/>`,
    details: `<path d="M98 300 C170 288 260 286 322 291" stroke="${shade(c, -0.3)}" stroke-width="3" fill="none"/>
      <path d="M84 302 C150 330 284 334 334 290 C284 340 150 350 84 302 Z" fill="${shade(c, -0.25)}"/>
      <line x1="236" y1="292" x2="292" y2="122" stroke="#6b4a2f" stroke-width="5" stroke-linecap="round"/>
      <path d="M292 120 C280 96 306 84 292 60 C280 40 300 26 292 8" stroke="#9aa3a0" stroke-width="3" fill="none" opacity=".7"/>`,
  }),
  colmeia: (c) => {
    const hex = (cx: number, cy: number) => {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        return `${(cx + 42 * Math.cos(a)).toFixed(1)},${(cy + 42 * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      return `<polygon points="${pts}"/>`;
    };
    return {
      shapes: hex(164, 288) + hex(237, 288) + hex(200, 226),
      details: `<g stroke-linecap="round" stroke-width="7">
          <line x1="190" y1="226" x2="176" y2="132" stroke="#1f4e5a"/>
          <line x1="206" y1="226" x2="222" y2="140" stroke="#d89a2b"/>
          <line x1="164" y1="288" x2="150" y2="200" stroke="#b8613f"/>
          <line x1="240" y1="288" x2="262" y2="196" stroke="#3d4240"/>
        </g>
        <g fill="${shade(c, -0.4)}"><circle cx="164" cy="288" r="22"/><circle cx="237" cy="288" r="22"/><circle cx="200" cy="226" r="22"/></g>`,
    };
  },
  nuvem: (c) => ({
    shapes: `<circle cx="150" cy="248" r="48"/><circle cx="210" cy="226" r="62"/><circle cx="272" cy="250" r="44"/><rect x="104" y="250" width="214" height="46" rx="10"/>`,
    details: `<rect x="104" y="288" width="214" height="10" rx="4" fill="${shade(c, -0.25)}"/>
      <polygon points="186,170 234,170 228,206 192,206" fill="#b8613f"/>
      <g fill="#4f7d4a"><ellipse cx="198" cy="150" rx="10" ry="24" transform="rotate(-24 198 150)"/><ellipse cx="220" cy="148" rx="10" ry="26" transform="rotate(20 220 148)"/></g>`,
  }),
};

// ---------- composição das 3 vistas ----------
function svgDoc(inner: string, defs: string, label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800" role="img" aria-label="${label}">
<defs>
  <pattern id="camadas" width="6" height="4" patternUnits="userSpaceOnUse"><rect width="6" height="1.2" fill="#000" opacity=".09"/></pattern>
  ${defs}
</defs>
${inner}
</svg>
`;
}

function objectLayer(p: ProductSeed, color: string, id: string): { defs: string; body: string } {
  const { shapes, details } = p.draw(color);
  return {
    defs: `<clipPath id="${id}">${shapes}</clipPath>`,
    body: `<g fill="${color}">${shapes}</g>${details}<rect width="400" height="400" fill="url(#camadas)" clip-path="url(#${id})"/>`,
  };
}

function viewFront(p: ProductSeed, color: string): string {
  const o = objectLayer(p, color, "obj");
  return svgDoc(
    `<rect width="400" height="400" fill="#ffffff"/>
     <ellipse cx="214" cy="338" rx="120" ry="16" fill="#262a28" opacity=".14"/>
     ${o.body}`,
    o.defs,
    `${p.name} — vista frontal (ilustração)`,
  );
}

function viewDetail(p: ProductSeed, color: string): string {
  const o = objectLayer(p, color, "obj");
  return svgDoc(
    `<rect width="400" height="400" fill="${shade(color, -0.55)}"/>
     <g transform="translate(-260 -330) scale(2.6)">${o.body}</g>
     <rect x="18" y="352" width="150" height="30" rx="4" fill="#f5f4f0" opacity=".92"/>
     <text x="30" y="372" font-family="Arial, sans-serif" font-size="14" fill="#262a28">detalhe das camadas</text>`,
    o.defs,
    `${p.name} — detalhe das camadas de impressão (ilustração)`,
  );
}

function viewRoom(p: ProductSeed, color: string): string {
  const o = objectLayer(p, color, "obj");
  // parede verde-água com sombra de cobogó projetada
  let cobogo = "";
  for (let y = -40; y < 340; y += 64)
    for (let x = -40; x < 440; x += 64)
      cobogo += `<circle cx="${x + 32}" cy="${y + 32}" r="22"/>`;
  return svgDoc(
    `<rect width="400" height="400" fill="#9fd3c1"/>
     <g fill="#5e9c88" opacity=".35" transform="skewX(-14) translate(60 0)">${cobogo}</g>
     <rect y="330" width="400" height="70" fill="#c9b79a"/>
     <rect y="326" width="400" height="8" fill="#a8946f"/>
     <g transform="translate(40 0) scale(0.82) translate(40 72)">
       <ellipse cx="214" cy="338" rx="120" ry="14" fill="#262a28" opacity=".18"/>
       ${o.body}
     </g>`,
    o.defs,
    `${p.name} — em ambiente (ilustração)`,
  );
}

// ---------- catálogo ----------
const products: ProductSeed[] = [
  {
    slug: "vaso-onda",
    name: "Vaso Onda",
    description:
      "Vaso de linhas onduladas que pega a luz de um jeito diferente em cada hora do dia. Serve para flores secas ou, na versão PETG, para água.",
    dimensions: "10 × 10 × 24 cm",
    productionDays: 5,
    readyToShip: true,
    draw: draws.vaso,
    variants: [
      { key: "pla-verde-agua", name: "Verde-água", material: "PLA", colorHex: "#8fcbb6", priceCents: 8990 },
      { key: "pla-areia", name: "Areia", material: "PLA", colorHex: "#d9c6a5", priceCents: 8990 },
      { key: "petg-translucido", name: "Translúcido", material: "PETG", colorHex: "#cfe3e6", priceCents: 10990 },
    ],
  },
  {
    slug: "luminaria-cobogo",
    name: "Luminária Cobogó",
    description:
      "Luminária de mesa vazada inspirada nos cobogós das varandas. Acompanha soquete E27 e cabo com interruptor; a lâmpada LED não está inclusa.",
    dimensions: "12 × 12 × 26 cm",
    productionDays: 7,
    readyToShip: false,
    draw: draws.luminaria,
    variants: [
      { key: "pla-branco", name: "Branco", material: "PLA", colorHex: "#f2f1ec", priceCents: 18990 },
      { key: "pla-ocre", name: "Ocre", material: "PLA", colorHex: "#d89a2b", priceCents: 19990 },
    ],
  },
  {
    slug: "cachepo-geometrico",
    name: "Cachepô Geométrico",
    description:
      "Cachepô facetado para vasos de até 12 cm. Tem furo de drenagem e pratinho encaixado, então pode ir direto na estante.",
    dimensions: "14 × 14 × 13 cm",
    productionDays: 4,
    readyToShip: true,
    draw: draws.cachepo,
    variants: [
      { key: "pla-terracota", name: "Terracota", material: "PLA", colorHex: "#b8613f", priceCents: 6990 },
      { key: "pla-grafite", name: "Grafite", material: "PLA", colorHex: "#3d4240", priceCents: 6990 },
      { key: "silk-cobre", name: "Cobre acetinado", material: "PLA Silk", colorHex: "#b87333", priceCents: 8490 },
    ],
  },
  {
    slug: "porta-incenso-folha",
    name: "Porta-incenso Folha",
    description:
      "Folha rasinha que segura a vareta e apara as cinzas. Pequena o bastante para o criado-mudo, bonita o bastante para ficar à vista.",
    dimensions: "18 × 7 × 2 cm",
    productionDays: 3,
    readyToShip: true,
    draw: draws.incenso,
    variants: [
      { key: "pla-verde", name: "Verde-folha", material: "PLA", colorHex: "#5f8f5a", priceCents: 3490 },
      { key: "pla-preto", name: "Preto", material: "PLA", colorHex: "#2a2a2a", priceCents: 3490 },
    ],
  },
  {
    slug: "organizador-colmeia",
    name: "Organizador Colmeia",
    description:
      "Três alvéolos hexagonais para canetas, pincéis e tesoura. Dá para encaixar mais de um e montar a sua própria colmeia na mesa.",
    dimensions: "16 × 13 × 10 cm",
    productionDays: 6,
    readyToShip: false,
    draw: draws.colmeia,
    variants: [
      { key: "pla-branco", name: "Branco", material: "PLA", colorHex: "#f2f1ec", priceCents: 7990 },
      { key: "petg-petroleo", name: "Azul-petróleo", material: "PETG", colorHex: "#1f4e5a", priceCents: 9490 },
    ],
  },
  {
    slug: "prateleira-nuvem",
    name: "Prateleira Nuvem",
    description:
      "Prateleira de parede em forma de nuvem, para plantinhas e miniaturas. Vai com buchas e parafusos; aguenta até 2 kg.",
    dimensions: "30 × 10 × 14 cm",
    productionDays: 8,
    readyToShip: false,
    draw: draws.nuvem,
    variants: [
      { key: "pla-branco", name: "Branco", material: "PLA", colorHex: "#f2f1ec", priceCents: 11990 },
      { key: "pla-rosa", name: "Rosa", material: "PLA", colorHex: "#e8a5a5", priceCents: 11990 },
      { key: "pla-madeira", name: "Madeira", material: "PLA Wood", colorHex: "#a9784f", priceCents: 13990 },
    ],
  },
];

async function main() {
  const outDir = join(process.cwd(), "public", "produtos");
  mkdirSync(outDir, { recursive: true });

  for (const [index, p] of products.entries()) {
    const color = p.variants[0].colorHex;
    const files = [
      { file: `${p.slug}-1.svg`, svg: viewFront(p, color), alt: `${p.name}, vista frontal` },
      { file: `${p.slug}-2.svg`, svg: viewRoom(p, color), alt: `${p.name} em ambiente` },
      { file: `${p.slug}-3.svg`, svg: viewDetail(p, color), alt: `${p.name}, detalhe das camadas` },
    ];
    for (const f of files) writeFileSync(join(outDir, f.file), f.svg, "utf8");

    const data = {
      name: p.name,
      description: p.description,
      dimensions: p.dimensions,
      productionDays: p.productionDays,
      readyToShip: p.readyToShip,
      position: index,
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: files.map((f, i) => ({ productId: product.id, url: `/produtos/${f.file}`, alt: f.alt, position: i })),
    });

    // IDs determinísticos: carrinhos salvos no navegador continuam válidos após novo seed
    for (const [vi, v] of p.variants.entries()) {
      const id = `${p.slug}--${v.key}`;
      const vData = { name: v.name, material: v.material, colorHex: v.colorHex, priceCents: v.priceCents, position: vi };
      await prisma.variant.upsert({
        where: { id },
        update: vData,
        create: { id, productId: product.id, ...vData },
      });
    }
  }

  const count = await prisma.product.count();
  console.log(`Seed concluído: ${count} produtos, imagens em public/produtos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
