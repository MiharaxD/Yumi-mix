import { z } from "zod";
import { quoteCart } from "@/lib/cart-server";
import { cartItemsSchema } from "@/lib/schemas";

const bodySchema = z.object({ items: cartItemsSchema });

/** Cotação do carrinho: preços sempre lidos do banco. */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Carrinho inválido." }, { status: 400 });
  }
  return Response.json(await quoteCart(parsed.data.items));
}
