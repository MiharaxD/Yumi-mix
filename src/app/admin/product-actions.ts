"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { deleteUpload } from "@/lib/uploads";
import { mediaUrlToUploadPath, productFieldErrors, productInputSchema, slugify } from "@/lib/product-admin";
import { parseBRLToCents } from "@/lib/money";
import { normalizeTrackingCode, sendTrackingEmail, shipOrder } from "@/lib/orders";
import { siteUrl } from "@/lib/og";

export type FormState = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** ids das variações na ordem do formulário, depois de salvar */
  variantIds?: string[];
};

async function denied(): Promise<FormState | null> {
  return (await isAdmin()) ? null : { error: "Sessão expirada. Entre de novo." };
}

function revalidateStore(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/produto/${slug}`);
  revalidatePath("/admin/produtos");
}

async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  let slug = base;
  for (let n = 2; ; n++) {
    const taken = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!taken || taken.id === exceptId) return slug;
    slug = `${base}-${n}`;
  }
}

async function resolveCategory(categoryId: string, newCategory: string): Promise<string | null> {
  if (categoryId === "__nova__") {
    const slug = slugify(newCategory);
    const last = await prisma.category.findFirst({ orderBy: { position: "desc" } });
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name: newCategory, position: (last?.position ?? -1) + 1 },
    });
    return cat.id;
  }
  if (!categoryId) return null;
  const cat = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  return cat?.id ?? null;
}

/** Cria ou edita um produto (dados, frete e variações). Fotos e arquivos vão pela rota de mídia. */
export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const no = await denied();
  if (no) return no;

  const id = String(formData.get("productId") ?? "");
  let variantsRaw: unknown = [];
  try {
    variantsRaw = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    return { error: "Não deu para ler as variações. Recarregue a página." };
  }

  const parsed = productInputSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    dimensions: String(formData.get("dimensions") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    newCategory: String(formData.get("newCategory") ?? ""),
    readyToShip: formData.get("readyToShip") === "on",
    productionDays: String(formData.get("productionDays") ?? ""),
    shopeeUrl: String(formData.get("shopeeUrl") ?? ""),
    mercadoLivreUrl: String(formData.get("mercadoLivreUrl") ?? ""),
    shopeePrice: String(formData.get("shopeePrice") ?? ""),
    mercadoLivrePrice: String(formData.get("mercadoLivrePrice") ?? ""),
    shippingCredit: String(formData.get("shippingCredit") ?? ""),
    weightGrams: String(formData.get("weightGrams") ?? ""),
    boxHeightCm: String(formData.get("boxHeightCm") ?? ""),
    boxWidthCm: String(formData.get("boxWidthCm") ?? ""),
    boxLengthCm: String(formData.get("boxLengthCm") ?? ""),
    variants: variantsRaw,
  });
  if (!parsed.success) {
    return { error: "Confira os campos destacados.", fieldErrors: productFieldErrors(parsed.error) };
  }
  const d = parsed.data;
  const categoryId = await resolveCategory(d.categoryId, d.newCategory);

  const data = {
    name: d.name,
    description: d.description,
    dimensions: d.dimensions,
    categoryId,
    readyToShip: d.readyToShip,
    productionDays: d.productionDays,
    shopeeUrl: d.shopeeUrl,
    mercadoLivreUrl: d.mercadoLivreUrl,
    shopeePriceCents: d.shopeePrice,
    mercadoLivrePriceCents: d.mercadoLivrePrice,
    shippingCreditCents: d.shippingCredit,
    weightGrams: d.weightGrams,
    boxHeightCm: d.boxHeightCm,
    boxWidthCm: d.boxWidthCm,
    boxLengthCm: d.boxLengthCm,
  };

  if (!id) {
    const last = await prisma.product.findFirst({ orderBy: { position: "desc" } });
    const created = await prisma.product.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(d.name)),
        position: (last?.position ?? -1) + 1,
        variants: {
          create: d.variants.map((v, i) => ({
            name: v.name,
            material: v.material,
            colorHex: v.colorHex.toLowerCase(),
            priceCents: v.price,
            position: i,
          })),
        },
      },
    });
    revalidateStore(created.slug);
    redirect(`/admin/produtos/${created.id}?novo=1`);
  }

  const product = await prisma.product.findUnique({ where: { id }, include: { variants: { select: { id: true } } } });
  if (!product) return { error: "Produto não encontrado." };

  const keep = new Set(d.variants.map((v) => v.id).filter((vid) => product.variants.some((pv) => pv.id === vid)));
  await prisma.$transaction([
    prisma.product.update({ where: { id }, data }),
    // variação removida: pedidos antigos guardam nome e preço, carrinhos com ela a descartam
    prisma.variant.deleteMany({ where: { productId: id, id: { notIn: [...keep] } } }),
    ...d.variants.map((v, i) => {
      const vData = { name: v.name, material: v.material, colorHex: v.colorHex.toLowerCase(), priceCents: v.price, position: i };
      return keep.has(v.id)
        ? prisma.variant.update({ where: { id: v.id }, data: vData })
        : prisma.variant.create({ data: { ...vData, productId: id } });
    }),
  ]);

  revalidateStore(product.slug);
  revalidatePath(`/admin/produtos/${id}`);
  const saved = await prisma.variant.findMany({ where: { productId: id }, orderBy: { position: "asc" }, select: { id: true } });
  return { ok: true, message: "Produto salvo.", variantIds: saved.map((v) => v.id) };
}

/** Arquiva (some da loja) ou reativa um produto. */
export async function setArchivedAction(productId: string, archived: boolean): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const p = await prisma.product.update({ where: { id: productId }, data: { archived } });
  revalidateStore(p.slug);
  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true, message: archived ? "Produto arquivado: saiu da loja." : "Produto de volta na loja." };
}

/** Exclui de vez — só se a peça nunca foi vendida. */
export async function deleteProductAction(productId: string): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { images: true, variants: { select: { id: true } } } });
  if (!product) return { error: "Produto não encontrado." };
  const sold = await prisma.orderItem.count({
    where: { OR: [{ productId }, { variantId: { in: product.variants.map((v) => v.id) } }] },
  });
  if (sold > 0) return { error: "Esta peça já foi vendida: arquive em vez de excluir, para os pedidos antigos continuarem completos." };

  await prisma.product.delete({ where: { id: productId } });
  await Promise.all([
    ...product.images.map((i) => deleteUpload(mediaUrlToUploadPath(i.url))),
    deleteUpload(mediaUrlToUploadPath(product.videoUrl)),
    deleteUpload(product.printFilePath),
  ]);
  revalidateStore(product.slug);
  redirect("/admin/produtos?excluido=1");
}

export async function deleteImageAction(imageId: string): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const img = await prisma.productImage.findUnique({ where: { id: imageId }, include: { product: { select: { slug: true, id: true } } } });
  if (!img) return { error: "Foto não encontrada." };
  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteUpload(mediaUrlToUploadPath(img.url));
  revalidateStore(img.product.slug);
  revalidatePath(`/admin/produtos/${img.product.id}`);
  return { ok: true };
}

/** Troca a foto de lugar com a vizinha (-1 sobe, +1 desce). A primeira é a capa. */
export async function moveImageAction(imageId: string, dir: -1 | 1): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const img = await prisma.productImage.findUnique({ where: { id: imageId }, include: { product: { select: { slug: true } } } });
  if (!img) return { error: "Foto não encontrada." };
  const all = await prisma.productImage.findMany({ where: { productId: img.productId }, orderBy: [{ position: "asc" }, { id: "asc" }] });
  const i = all.findIndex((x) => x.id === imageId);
  const j = i + dir;
  if (j < 0 || j >= all.length) return { ok: true };
  [all[i], all[j]] = [all[j], all[i]];
  await prisma.$transaction(all.map((x, pos) => prisma.productImage.update({ where: { id: x.id }, data: { position: pos } })));
  revalidateStore(img.product.slug);
  revalidatePath(`/admin/produtos/${img.productId}`);
  return { ok: true };
}

export async function removeVideoAction(productId: string): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const p = await prisma.product.findUnique({ where: { id: productId } });
  if (!p) return { error: "Produto não encontrado." };
  await prisma.product.update({ where: { id: productId }, data: { videoUrl: null } });
  await deleteUpload(mediaUrlToUploadPath(p.videoUrl));
  revalidateStore(p.slug);
  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true };
}

export async function removePrintFileAction(productId: string): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const p = await prisma.product.findUnique({ where: { id: productId } });
  if (!p) return { error: "Produto não encontrado." };
  await prisma.product.update({ where: { id: productId }, data: { printFilePath: null, printFileName: null, printFileBytes: null } });
  await deleteUpload(p.printFilePath);
  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true };
}

/** Configuração de frete da loja. */
export async function saveShippingSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const fieldErrors: Record<string, string> = {};

  const originCep = String(formData.get("originCep") ?? "").replace(/\D/g, "");
  if (!/^\d{8}$/.test(originCep)) fieldErrors.originCep = "O CEP tem 8 números.";

  const freeOn = formData.get("freeOn") === "on";
  const threshold = parseBRLToCents(String(formData.get("freeThreshold") ?? ""));
  if (freeOn && (threshold === null || threshold <= 0)) fieldErrors.freeThreshold = "Informe um valor, ex.: 200,00.";

  const fallback = parseBRLToCents(String(formData.get("fallbackShipping") ?? ""));
  if (fallback === null || fallback < 0) fieldErrors.fallbackShipping = "Informe um valor, ex.: 20,00.";

  const days = Number(String(formData.get("fallbackDays") ?? ""));
  if (!Number.isInteger(days) || days < 1 || days > 60) fieldErrors.fallbackDays = "De 1 a 60 dias úteis.";

  if (Object.keys(fieldErrors).length > 0) return { error: "Confira os campos destacados.", fieldErrors };

  const data = {
    originCep,
    freeShippingThresholdCents: freeOn ? threshold : null,
    fallbackShippingCents: fallback!,
    fallbackShippingDays: days,
  };
  await prisma.storeSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Frete salvo." };
}

/** Salva o código de rastreio, marca como enviado e manda o email ao cliente. */
export async function shipOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const orderId = String(formData.get("orderId") ?? "");
  const code = normalizeTrackingCode(String(formData.get("trackingCode") ?? ""));
  if (!code) return { error: "Código inválido: use só letras e números, ex.: AB123456789BR.", fieldErrors: { trackingCode: "Código inválido." } };

  const result = await shipOrder(orderId, code, siteUrl()?.origin ?? null);
  revalidatePath("/admin");
  revalidatePath(`/admin/pedidos/${orderId}`);
  if (result.status === "not_found") return { error: "Pedido não encontrado." };
  if (result.status === "invalid_status") return { error: "Só dá para enviar pedidos pagos ou em produção." };
  if (result.status !== "ok") return { error: "O pedido mudou enquanto você editava. Recarregue a página." };
  return result.emailed
    ? { ok: true, message: "Pedido enviado e email de rastreio mandado ao cliente." }
    : { ok: true, error: `Rastreio salvo, mas o email não foi: ${result.emailError}` };
}

export async function resendTrackingAction(orderId: string): Promise<FormState> {
  const no = await denied();
  if (no) return no;
  const result = await sendTrackingEmail(orderId, siteUrl()?.origin ?? null);
  revalidatePath(`/admin/pedidos/${orderId}`);
  if (result.status !== "ok") return { error: "Pedido sem código de rastreio." };
  return result.emailed ? { ok: true, message: "Email reenviado." } : { error: result.emailError };
}
