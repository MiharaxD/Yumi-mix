import { beforeAll, describe, expect, it } from "vitest";
import { parseMelhorEnvioOptions } from "@/lib/melhor-envio";
import { bambuStudioLink, createPrintToken, printFilePath, safePrintName, verifyPrintToken } from "@/lib/print-files";
import { productInputSchema, productFieldErrors, slugify } from "@/lib/product-admin";
import { normalizeTrackingCode } from "@/lib/orders";
import { trackingUrl } from "@/lib/email";
import { cepSchema, checkoutSchema } from "@/lib/schemas";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET ??= "segredo-de-teste-com-mais-de-32-caracteres!!";
});

describe("Melhor Envio", () => {
  it("lê preço com desconto, prazo e transportadora, e pula opções com erro", () => {
    const out = parseMelhorEnvioOptions([
      { id: 1, name: "PAC", price: "25.90", custom_price: "21.40", delivery_time: 6, company: { name: "Correios" } },
      { id: 2, name: "SEDEX", price: "40.00", delivery_time: 2, company: { name: "Correios" } },
      { id: 3, name: "Mini", error: "Dimensões não atendidas", company: { name: "Correios" } },
    ]);
    expect(out).toEqual([
      { id: "1", name: "PAC", company: "Correios", realCents: 2140, days: 6 },
      { id: "2", name: "SEDEX", company: "Correios", realCents: 4000, days: 2 },
    ]);
  });
  it("resposta inesperada vira lista vazia", () => {
    expect(parseMelhorEnvioOptions({ message: "Unauthenticated." })).toEqual([]);
  });
});

describe("link do arquivo 3D", () => {
  it("token vale para o produto certo até expirar", () => {
    const now = Date.now();
    const token = createPrintToken("p1", now);
    expect(verifyPrintToken("p1", token, now)).toBe(true);
    expect(verifyPrintToken("p2", token, now)).toBe(false);
    expect(verifyPrintToken("p1", token, now + 7 * 3600 * 1000)).toBe(false);
    expect(verifyPrintToken("p1", "123.abc", now)).toBe(false);
    expect(verifyPrintToken("p1", "lixo", now)).toBe(false);
  });
  it("nome seguro termina em .3mf", () => {
    expect(safePrintName("Porta-escova Ônix v2.3mf")).toBe("Porta-escova-Onix-v2.3mf");
    expect(safePrintName("../../etc")).toBe("etc.3mf");
  });
  it("link do Bambu Studio codifica a URL inteira", () => {
    const url = `https://loja.test${printFilePath("p1", "peca.3mf")}`;
    expect(bambuStudioLink(url)).toBe(`bambustudioopen://${encodeURIComponent(url)}`);
  });
});

describe("rastreio", () => {
  it("normaliza o código colado", () => {
    expect(normalizeTrackingCode("  aa123456789br ")).toBe("AA123456789BR");
    expect(normalizeTrackingCode("AA 1234 5678 9BR")).toBe("AA123456789BR");
    expect(normalizeTrackingCode("abc")).toBeNull();
    expect(normalizeTrackingCode("<script>")).toBeNull();
  });
  it("link de acompanhamento", () => {
    expect(trackingUrl("AA123456789BR")).toBe("https://www.melhorrastreio.com.br/rastreio/AA123456789BR");
  });
});

describe("formulário de produto", () => {
  const base = {
    name: "Porta-escova",
    description: "Porta-escova de parede, fácil de limpar.",
    dimensions: "",
    categoryId: "",
    newCategory: "",
    readyToShip: true,
    productionDays: "3",
    shopeeUrl: "",
    mercadoLivreUrl: "",
    shippingCredit: "10,00",
    weightGrams: "250",
    boxHeightCm: "10",
    boxWidthCm: "15",
    boxLengthCm: "20",
    variants: [{ id: "", name: "Branco", material: "", colorHex: "#ffffff", price: "39,90" }],
  };
  it("converte preço e frete embutido em centavos", () => {
    const r = productInputSchema.parse(base);
    expect(r.shippingCredit).toBe(1000);
    expect(r.variants[0].price).toBe(3990);
  });
  it("aponta o erro na variação certa", () => {
    const r = productInputSchema.safeParse({ ...base, variants: [{ ...base.variants[0], price: "abc" }] });
    expect(r.success).toBe(false);
    if (!r.success) expect(productFieldErrors(r.error)).toHaveProperty(["variants.0.price"]);
  });
  it("nova categoria precisa de nome", () => {
    expect(productInputSchema.safeParse({ ...base, categoryId: "__nova__" }).success).toBe(false);
  });
  it("links das lojas: vazio vira null, sem https ganha https", () => {
    const r = productInputSchema.parse({
      ...base,
      shopeeUrl: "shopee.com.br/Gancho-i.123.456",
      mercadoLivreUrl: "https://produto.mercadolivre.com.br/MLB-123-gancho",
    });
    expect(r.shopeeUrl).toBe("https://shopee.com.br/Gancho-i.123.456");
    expect(r.mercadoLivreUrl).toBe("https://produto.mercadolivre.com.br/MLB-123-gancho");
    expect(productInputSchema.parse(base).shopeeUrl).toBeNull();
  });
  it("recusa link de outro site no campo da loja", () => {
    const r = productInputSchema.safeParse({ ...base, shopeeUrl: "https://shopee.com.br.golpe.com/x", mercadoLivreUrl: "https://shopee.com.br/x" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = productFieldErrors(r.error);
      expect(errs).toHaveProperty("shopeeUrl");
      expect(errs).toHaveProperty("mercadoLivreUrl");
    }
  });
  it("slug sem acento", () => {
    expect(slugify("Saboneteira Dupla Ônix")).toBe("saboneteira-dupla-onix");
  });
});

describe("checkout", () => {
  const ok = {
    customerName: "Ana Souza",
    email: "ana@exemplo.com",
    whatsapp: "(11) 91234-5678",
    cep: "01310-100",
    street: "Avenida Paulista",
    streetNumber: "1000",
    complement: "",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    uf: "SP",
    shippingOptionId: "1",
    items: [{ variantId: "v1", quantity: 1 }],
  };
  it("aceita o pedido completo", () => {
    expect(checkoutSchema.safeParse(ok).success).toBe(true);
  });
  it("exige nome e sobrenome, bairro e frete", () => {
    expect(checkoutSchema.safeParse({ ...ok, customerName: "Ana" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...ok, neighborhood: "" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...ok, shippingOptionId: "" }).success).toBe(false);
  });
  it("CEP com 8 números", () => {
    expect(cepSchema.safeParse("01310100").success).toBe(true);
    expect(cepSchema.safeParse("0131").success).toBe(false);
  });
});
