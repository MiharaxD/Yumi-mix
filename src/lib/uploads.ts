import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join, normalize, sep } from "node:path";
import { CUSTOM_MAX_IMAGE_BYTES } from "@/config";

/** Pasta de uploads: fora de /public, só servida pela rota protegida do admin. */
export const UPLOAD_ROOT = join(process.cwd(), "uploads");

export type ImageKind = { mime: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

/** Detecta o tipo REAL pelos primeiros bytes (assinatura), ignorando nome e Content-Type. */
export function detectImageType(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) {
    return { mime: "image/png", ext: "png" };
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

export type ValidatedImage = { bytes: Uint8Array; kind: ImageKind };

export type ImageValidationError = { index: number; name: string; message: string };

export async function validateImages(files: File[]) {
  const ok: ValidatedImage[] = [];
  const errors: ImageValidationError[] = [];
  for (const [index, file] of files.entries()) {
    if (file.size > CUSTOM_MAX_IMAGE_BYTES) {
      errors.push({ index, name: file.name, message: `"${file.name}" passa de 5 MB.` });
      continue;
    }
    if (file.size === 0) {
      errors.push({ index, name: file.name, message: `"${file.name}" está vazio.` });
      continue;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.byteLength > CUSTOM_MAX_IMAGE_BYTES) {
      errors.push({ index, name: file.name, message: `"${file.name}" passa de 5 MB.` });
      continue;
    }
    const kind = detectImageType(bytes);
    if (!kind) {
      errors.push({ index, name: file.name, message: `"${file.name}" não é JPG, PNG nem WEBP.` });
      continue;
    }
    ok.push({ bytes, kind });
  }
  return { ok, errors };
}

/** Grava em ./uploads/<pasta>/<uuid>.<ext> e devolve o caminho relativo. */
export async function saveImage(folder: string, img: ValidatedImage): Promise<string> {
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const dir = join(UPLOAD_ROOT, safeFolder);
  await mkdir(dir, { recursive: true });
  const fileName = `${randomUUID()}.${img.kind.ext}`;
  await writeFile(join(dir, fileName), img.bytes);
  return `${safeFolder}/${fileName}`;
}

/** Lê um upload garantindo que o caminho não escapa de ./uploads. */
export async function readUpload(relativePath: string): Promise<Buffer | null> {
  const full = normalize(join(UPLOAD_ROOT, relativePath));
  if (!full.startsWith(UPLOAD_ROOT + sep)) return null;
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}
