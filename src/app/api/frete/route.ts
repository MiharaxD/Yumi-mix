import { z } from "zod";
import { quoteCartInternal, quoteShipping } from "@/lib/cart-server";
import { cartItemsSchema, cepSchema } from "@/lib/schemas";
import { getStoreSettings } from "@/lib/settings";
import { missingForFreeShipping } from "@/lib/pricing";

const bodySchema = z.object({ items: cartItemsSchema.min(1), cep: cepSchema });

/**
 * Opções de frete para um CEP, já com o frete embutido abatido.
 * Nunca devolve o valor real nem o embutido.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const cepIssue = parsed.error.issues.find((i) => i.path[0] === "cep");
    return Response.json({ error: cepIssue?.message ?? "Carrinho inválido." }, { status: 422 });
  }
  const cart = await quoteCartInternal(parsed.data.items);
  if (cart.lines.length === 0) return Response.json({ error: "Carrinho vazio." }, { status: 422 });

  const [shipping, settings] = await Promise.all([quoteShipping(parsed.data.cep, cart), getStoreSettings()]);
  if (shipping.options.length === 0) {
    return Response.json({ error: "Não encontramos entrega para esse CEP. Confira o número." }, { status: 422 });
  }
  return Response.json({
    options: shipping.options,
    leadTimeDays: cart.leadTimeDays,
    missingForFree: missingForFreeShipping(cart.subtotalCents, settings.freeShippingThresholdCents),
  });
}
