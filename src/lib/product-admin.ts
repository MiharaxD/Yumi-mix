import { z } from "zod";
import { parseBRLToCents } from "@/lib/money";

// Validação do formulário de produto do admin (puro, testável).

/** "Suporte de Lavadora 3D" → "suporte-de-lavadora-3d". */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "peca"
  );
}

/** "/media/produtos/x.jpg" → "produtos/x.jpg" (só arquivos enviados pelo admin). */
export function mediaUrlToUploadPath(url: string | null | undefined): string | null {
  if (!url?.startsWith("/media/")) return null;
  return url.slice("/media/".length);
}

const money = (msg: string) =>
  z.string().transform((v, ctx) => {
    const cents = v.trim() === "" ? 0 : parseBRLToCents(v);
    if (cents === null || cents < 0) {
      ctx.addIssue({ code: "custom", message: msg });
      return z.NEVER;
    }
    return cents;
  });

const int = (min: number, max: number, msg: string) =>
  z.string().transform((v, ctx) => {
    const n = Number(v.trim().replace(",", "."));
    if (!Number.isInteger(n) || n < min || n > max) {
      ctx.addIssue({ code: "custom", message: msg });
      return z.NEVER;
    }
    return n;
  });

/** Domínios aceitos por loja (inclui links curtos de compartilhar). */
export const MARKETPLACE_HOSTS = {
  shopee: ["shopee.com.br", "shope.ee"],
  mercadoLivre: ["mercadolivre.com.br", "mercadolivre.com", "meli.la"],
} as const;

/** Separa o campo de links (um ou mais anúncios, separados por espaço ou linha). */
export function splitMarketplaceUrls(value: string | null | undefined): string[] {
  return (value ?? "").split(/\s+/).filter(Boolean);
}

/** Link(s) https de anúncios da loja, ou vazio (= null). Vários links: a página alterna entre eles. */
export function marketplaceUrl(hosts: readonly string[], msg: string) {
  return z.string().transform((v, ctx) => {
    const parts = splitMarketplaceUrls(v);
    if (parts.length === 0) return null;
    const urls: string[] = [];
    for (const text of parts) {
      let url: URL;
      try {
        url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
      } catch {
        ctx.addIssue({ code: "custom", message: msg });
        return z.NEVER;
      }
      const host = url.hostname.toLowerCase();
      if (!hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
        ctx.addIssue({ code: "custom", message: msg });
        return z.NEVER;
      }
      url.protocol = "https:";
      urls.push(url.toString());
    }
    return urls.join(" ");
  });
}

export const variantInputSchema = z.object({
  // id existente (edição) ou vazio (nova)
  id: z.string().max(100).default(""),
  name: z.string().trim().min(1, "Dê um nome à variação (ex.: Branco).").max(60),
  material: z.string().trim().max(60).default(""),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida."),
  price: z.string().transform((v, ctx) => {
    const cents = parseBRLToCents(v);
    if (cents === null || cents <= 0) {
      ctx.addIssue({ code: "custom", message: "Preço inválido, ex.: 39,90." });
      return z.NEVER;
    }
    return cents;
  }),
});

export const productInputSchema = z
  .object({
    name: z.string().trim().min(3, "Dê um nome com pelo menos 3 letras.").max(120),
    description: z.string().trim().min(10, "Escreva uma descrição (pelo menos uma frase).").max(3000),
    dimensions: z.string().trim().max(120).default(""),
    categoryId: z.string().max(100).default(""),
    newCategory: z.string().trim().max(60).default(""),
    readyToShip: z.boolean(),
    productionDays: int(1, 60, "Dias de produção: de 1 a 60."),
    shopeeUrl: marketplaceUrl(MARKETPLACE_HOSTS.shopee, "Cole o link do anúncio na Shopee (shopee.com.br)."),
    mercadoLivreUrl: marketplaceUrl(MARKETPLACE_HOSTS.mercadoLivre, "Cole o link do anúncio no Mercado Livre (mercadolivre.com.br)."),
    shippingCredit: money("Frete embutido inválido, ex.: 10,00."),
    weightGrams: int(1, 30000, "Peso em gramas: de 1 a 30.000."),
    boxHeightCm: int(1, 100, "Altura: de 1 a 100 cm."),
    boxWidthCm: int(1, 100, "Largura: de 1 a 100 cm."),
    boxLengthCm: int(1, 100, "Comprimento: de 1 a 100 cm."),
    variants: z.array(variantInputSchema).min(1, "Cadastre pelo menos uma variação com preço.").max(20),
  })
  .superRefine((v, ctx) => {
    if (v.categoryId === "__nova__" && v.newCategory.length < 2) {
      ctx.addIssue({ code: "custom", path: ["newCategory"], message: "Dê um nome à nova categoria." });
    }
  });

export type ProductInput = z.output<typeof productInputSchema>;

/** Erros por campo; variações viram "variants.<i>.<campo>". */
export function productFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}
