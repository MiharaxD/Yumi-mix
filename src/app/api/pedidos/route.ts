import { checkoutSchema } from "@/lib/schemas";
import { CartUnavailableError, createOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return Response.json({ error: "Confira os campos destacados.", fieldErrors }, { status: 422 });
  }

  try {
    const order = await createOrder(parsed.data);
    return Response.json({ id: order.id, number: order.number }, { status: 201 });
  } catch (e) {
    if (e instanceof CartUnavailableError) {
      return Response.json({ error: e.message }, { status: 409 });
    }
    console.error(e);
    return Response.json({ error: "Não conseguimos registrar o pedido. Tente de novo." }, { status: 500 });
  }
}
