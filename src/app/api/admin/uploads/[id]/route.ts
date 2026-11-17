import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { readUpload } from "@/lib/uploads";

/** Serve imagens de pedidos personalizados apenas para o admin logado. */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/uploads/[id]">) {
  if (!(await isAdmin())) return new Response("Não autorizado.", { status: 401 });

  const { id } = await ctx.params;
  const image = await prisma.customRequestImage.findUnique({ where: { id } });
  if (!image) return new Response("Não encontrado.", { status: 404 });

  const data = await readUpload(image.filePath);
  if (!data) return new Response("Não encontrado.", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
