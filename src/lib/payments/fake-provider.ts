import { createHash } from "node:crypto";
import { z } from "zod";
import type { CardCheckout, OrderForPayment, PaymentEvent, PaymentProvider, PixCharge } from "./provider";

const webhookSchema = z.object({
  orderId: z.string().min(1).max(100),
  outcome: z.enum(["approved", "rejected"]),
});

/** QR de mentira: grade determinística a partir do código, com "TESTE" no meio. */
function fakeQrSvg(seed: string): string {
  const size = 29;
  const bytes = createHash("sha256").update(seed).digest();
  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  let cells = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinder(x, y)) continue;
      const bit = bytes[(x * 7 + y * 13) % bytes.length] >> ((x + y) % 8);
      if (bit & 1) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  const finder = (x: number, y: number) =>
    `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${size + 4} ${size + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${size + 4}" height="${size + 4}" fill="#fff"/><g fill="#262a28">${cells}${finder(0, 0)}${finder(size - 7, 0)}${finder(0, size - 7)}</g><rect x="8.5" y="12" width="12" height="5" rx="1" fill="#e0a83a"/><text x="14.5" y="15.6" font-family="Arial,sans-serif" font-size="3.2" font-weight="700" text-anchor="middle" fill="#262a28">TESTE</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Provedor de mentira para a versão de teste. Não fala com nenhum serviço externo. */
export class FakeProvider implements PaymentProvider {
  readonly id = "fake";
  readonly isSimulated = true;

  async createPixCharge(order: OrderForPayment): Promise<PixCharge> {
    const amount = (order.totalCents / 100).toFixed(2);
    const ref = `YUMIMIX${order.number}TESTE`;
    // Formato parecido com o BR Code, mas sem chave real: não paga nada.
    const copyPaste = `00020126360014BR.GOV.BCB.PIX0114CHAVE-DE-TESTE5204000053039865406${amount}5802BR5915YUMI MIX TESTE6009SAO PAULO62${String(ref.length + 4).padStart(2, "0")}05${String(ref.length).padStart(2, "0")}${ref}6304TEST`;
    return {
      method: "pix",
      copyPaste,
      qrImageSrc: fakeQrSvg(copyPaste),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async createCardCheckout(): Promise<CardCheckout> {
    return { method: "cartao", checkoutUrl: null };
  }

  async parseWebhook(request: Request): Promise<PaymentEvent | null> {
    const json = await request.json().catch(() => null);
    const parsed = webhookSchema.safeParse(json);
    if (!parsed.success) return null;
    return {
      orderId: parsed.data.orderId,
      outcome: parsed.data.outcome,
      providerPaymentId: `fake_${Date.now()}`,
      reason: parsed.data.outcome === "rejected" ? "Recusado pelo emissor (simulação)." : undefined,
    };
  }
}
