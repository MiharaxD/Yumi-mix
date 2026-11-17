import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { CUSTOM_MAX_IMAGES } from "@/config";
import { createCustomRequest, customRequestSchema } from "@/lib/custom-requests";
import { saveImage, UPLOAD_ROOT, validateImages } from "@/lib/uploads";

/** Campo-isca: humanos não veem nem preenchem. */
const HONEYPOT_FIELD = "site";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Envio inválido. Tente de novo." }, { status: 400 });
  }

  // Robô preencheu o campo escondido: responde como sucesso e descarta.
  const honeypot = form.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return Response.json({ ok: true }, { status: 201 });
  }

  const fields = Object.fromEntries(
    ["name", "contact", "description", "dimensions", "materialColor", "quantity", "desiredDate"].map((k) => [
      k,
      form.get(k) ?? undefined,
    ]),
  );
  const parsed = customRequestSchema.safeParse(fields);
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  }

  const files = form.getAll("imagens").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) fieldErrors.imagens = "Envie pelo menos 1 imagem.";
  else if (files.length > CUSTOM_MAX_IMAGES) fieldErrors.imagens = `Envie no máximo ${CUSTOM_MAX_IMAGES} imagens.`;

  const images = files.length > 0 && files.length <= CUSTOM_MAX_IMAGES ? await validateImages(files) : null;
  if (images && images.errors.length > 0) fieldErrors.imagens = images.errors.map((e) => e.message).join(" ");

  if (!parsed.success || Object.keys(fieldErrors).length > 0 || !images) {
    return Response.json({ error: "Confira os campos destacados.", fieldErrors }, { status: 422 });
  }

  const id = randomUUID();
  try {
    const saved = [];
    for (const img of images.ok) {
      const filePath = await saveImage(id, img);
      saved.push({ filePath, mimeType: img.kind.mime, sizeBytes: img.bytes.byteLength });
    }
    const created = await createCustomRequest(parsed.data, saved, id);
    console.log(`[personalizado] nova solicitação #${created.number}`);
    return Response.json({ ok: true, number: created.number }, { status: 201 });
  } catch (e) {
    console.error(e);
    await rm(join(UPLOAD_ROOT, id), { recursive: true, force: true }).catch(() => {});
    return Response.json({ error: "Não conseguimos registrar o pedido. Tente de novo." }, { status: 500 });
  }
}
