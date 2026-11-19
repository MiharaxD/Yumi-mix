import type { RealShippingOption } from "@/lib/pricing";

// Cotação de frete na API do Melhor Envio (sem SDK: um POST só).
// Envs: MELHOR_ENVIO_TOKEN, MELHOR_ENVIO_SANDBOX ("true" usa o ambiente de testes),
// MELHOR_ENVIO_CONTACT (email técnico exigido no User-Agent pela API).

export type PackageItem = {
  id: string;
  quantity: number;
  weightGrams: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  unitPriceCents: number;
};

export function melhorEnvioConfigured(): boolean {
  return Boolean(process.env.MELHOR_ENVIO_TOKEN);
}

function baseUrl() {
  return process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br";
}

type ApiOption = {
  id: number | string;
  name: string;
  price?: string | number;
  custom_price?: string | number;
  delivery_time?: number;
  custom_delivery_time?: number;
  error?: string;
  company?: { name?: string };
};

const toCents = (v: string | number) => Math.round(Number(v) * 100);

/** Converte a resposta da API em opções válidas (ignora as que vieram com erro). */
export function parseMelhorEnvioOptions(data: unknown): RealShippingOption[] {
  if (!Array.isArray(data)) return [];
  const out: RealShippingOption[] = [];
  for (const o of data as ApiOption[]) {
    if (!o || o.error) continue;
    const raw = o.custom_price ?? o.price;
    if (raw === undefined || raw === null || !Number.isFinite(Number(raw))) continue;
    out.push({
      id: String(o.id),
      name: o.name,
      company: o.company?.name ?? "",
      realCents: toCents(raw),
      days: Number(o.custom_delivery_time ?? o.delivery_time ?? 0),
    });
  }
  return out;
}

/** Cota o pacote do carrinho. Lança erro se a API falhar; quem chama decide o plano B. */
export async function quoteMelhorEnvio(fromCep: string, toCep: string, items: PackageItem[]): Promise<RealShippingOption[]> {
  const contact = process.env.MELHOR_ENVIO_CONTACT ?? "contato@yumimix.com.br";
  const res = await fetch(`${baseUrl()}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
      "User-Agent": `Yumi Mix (${contact})`,
    },
    body: JSON.stringify({
      from: { postal_code: fromCep },
      to: { postal_code: toCep },
      products: items.map((i) => ({
        id: i.id,
        width: i.widthCm,
        height: i.heightCm,
        length: i.lengthCm,
        weight: i.weightGrams / 1000,
        insurance_value: i.unitPriceCents / 100,
        quantity: i.quantity,
      })),
      options: { receipt: false, own_hand: false },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Melhor Envio respondeu ${res.status}`);
  return parseMelhorEnvioOptions(await res.json());
}
