import { prisma } from "@/lib/db";
import { streamUpload } from "@/lib/uploads";
import { verifyPrintToken } from "@/lib/print-files";

/**
 * Baixa o .3mf de um produto por link assinado e temporário (gerado no admin).
 * Sem cookie de propósito: quem baixa é o Bambu Studio.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/arquivo-3d/[productId]/[token]/[name]">) {
  const { productId, token, name } = await ctx.params;
  if (!verifyPrintToken(productId, token)) return new Response("Link expirado. Abra de novo pelo painel.", { status: 403 });

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { printFilePath: true } });
  if (!product?.printFilePath) return new Response("Esta peça não tem arquivo 3D.", { status: 404 });

  return streamUpload(product.printFilePath, request, {
    "Content-Type": "model/3mf",
    "Content-Disposition": `attachment; filename="${name.replace(/[^a-zA-Z0-9._-]/g, "")}"`,
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
  });
}
