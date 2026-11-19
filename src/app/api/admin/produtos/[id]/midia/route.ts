import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { deleteUpload, detectImageType, detectVideoType, isZip, saveUpload } from "@/lib/uploads";
import { mediaUrlToUploadPath } from "@/lib/product-admin";
import {
  PRINT_FILE_MAX_BYTES,
  PRODUCT_MAX_IMAGE_BYTES,
  PRODUCT_MAX_IMAGES,
  PRODUCT_MAX_VIDEO_BYTES,
} from "@/config";

const mb = (n: number) => `${Math.round(n / 1024 / 1024)} MB`;

const fail = (error: string, status = 422) => Response.json({ error }, { status });

/** Upload de mídia de um produto (uma por requisição): foto, vídeo ou arquivo .3mf. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/produtos/[id]/midia">) {
  if (!(await isAdmin())) return fail("Sessão expirada. Entre de novo.", 401);

  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true, videoUrl: true, printFilePath: true, _count: { select: { images: true } } },
  });
  if (!product) return fail("Produto não encontrado.", 404);

  const form = await request.formData().catch(() => null);
  const kind = String(form?.get("kind") ?? "");
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Escolha um arquivo.");

  if (kind === "foto") {
    if (product._count.images >= PRODUCT_MAX_IMAGES) return fail(`Limite de ${PRODUCT_MAX_IMAGES} fotos por produto.`);
    if (file.size > PRODUCT_MAX_IMAGE_BYTES) return fail(`"${file.name}" passa de ${mb(PRODUCT_MAX_IMAGE_BYTES)}.`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (!type) return fail(`"${file.name}" não é JPG, PNG nem WEBP.`);
    const rel = await saveUpload("produtos", type.ext, bytes);
    const last = await prisma.productImage.findFirst({ where: { productId: id }, orderBy: { position: "desc" } });
    const image = await prisma.productImage.create({
      data: { productId: id, url: `/media/${rel}`, alt: product.name, position: (last?.position ?? -1) + 1 },
    });
    revalidate(product.slug, id);
    return Response.json({ image: { id: image.id, url: image.url, alt: image.alt } }, { status: 201 });
  }

  if (kind === "video") {
    if (file.size > PRODUCT_MAX_VIDEO_BYTES) return fail(`O vídeo passa de ${mb(PRODUCT_MAX_VIDEO_BYTES)}.`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectVideoType(bytes);
    if (!type) return fail("O vídeo precisa ser MP4, MOV ou WEBM.");
    const rel = await saveUpload("produtos", type.ext, bytes);
    await prisma.product.update({ where: { id }, data: { videoUrl: `/media/${rel}` } });
    await deleteUpload(mediaUrlToUploadPath(product.videoUrl));
    revalidate(product.slug, id);
    return Response.json({ videoUrl: `/media/${rel}` }, { status: 201 });
  }

  if (kind === "arquivo3d") {
    if (!/\.3mf$/i.test(file.name)) return fail("Envie o arquivo .3mf do Bambu Studio.");
    if (file.size > PRINT_FILE_MAX_BYTES) return fail(`O arquivo passa de ${mb(PRINT_FILE_MAX_BYTES)}.`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!isZip(bytes)) return fail("Esse arquivo não parece um .3mf válido.");
    const rel = await saveUpload("arquivos-3d", "3mf", bytes);
    await prisma.product.update({
      where: { id },
      data: { printFilePath: rel, printFileName: file.name.slice(0, 120), printFileBytes: file.size },
    });
    await deleteUpload(product.printFilePath);
    revalidatePath(`/admin/produtos/${id}`);
    return Response.json({ name: file.name, bytes: file.size }, { status: 201 });
  }

  return fail("Tipo de arquivo desconhecido.");
}

function revalidate(slug: string, id: string) {
  revalidatePath(`/produto/${slug}`);
  revalidatePath("/");
  revalidatePath(`/admin/produtos/${id}`);
}
