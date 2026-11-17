import { z } from "zod";
import { quoteCart } from "@/lib/cart-server";
import { cartItemsSchema } from "@/lib/schemas";

const bodySchema = z.object({
  items: cartItemsSchema,
  deliveryMethod: z.enum(["retirada", "entrega"]).default("entrega"),
});

/** Cotação do carrinho: preços sempre lidos do banco. */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Carrinho inválido." }, { status: 400 });
  }
  const quote = await quoteCart(parsed.data.items, parsed.data.deliveryMethod);
  return Response.json(quote);
}
