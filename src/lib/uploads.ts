import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
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

/** Vídeo: MP4/MOV (caixa "ftyp") ou WEBM (EBML). */
export function detectVideoType(bytes: Uint8Array): { mime: string; ext: string } | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length >= 12 && ascii(4, 8) === "ftyp") {
    return ascii(8, 10) === "qt" ? { mime: "video/quicktime", ext: "mov" } : { mime: "video/mp4", ext: "mp4" };
  }
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { mime: "video/webm", ext: "webm" };
  }
  return null;
}

/** .3mf é um ZIP: começa com "PK". */
export function isZip(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

/** Grava bytes em ./uploads/<pasta>/<uuid>.<ext> e devolve o caminho relativo. */
export async function saveUpload(folder: string, ext: string, bytes: Uint8Array): Promise<string> {
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeExt = ext.replace(/[^a-z0-9]/g, "");
  const dir = join(UPLOAD_ROOT, safeFolder);
  await mkdir(dir, { recursive: true });
  const fileName = `${randomUUID()}.${safeExt}`;
  await writeFile(join(dir, fileName), bytes);
  return `${safeFolder}/${fileName}`;
}

function resolveInside(relativePath: string): string | null {
  const full = normalize(join(UPLOAD_ROOT, relativePath));
  return full.startsWith(UPLOAD_ROOT + sep) ? full : null;
}

/** Apaga um upload (ignora se já não existe). */
export async function deleteUpload(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) return;
  const full = resolveInside(relativePath);
  if (full) await rm(full, { force: true });
}

/**
 * Resposta HTTP em streaming para um upload, com suporte a Range
 * (o Safari exige isso para tocar vídeo).
 */
export async function streamUpload(
  relativePath: string,
  request: Request,
  headers: Record<string, string>,
): Promise<Response> {
  const full = resolveInside(relativePath);
  if (!full) return new Response("Não encontrado.", { status: 404 });
  let size: number;
  try {
    size = (await stat(full)).size;
  } catch {
    return new Response("Não encontrado.", { status: 404 });
  }

  const base = { ...headers, "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff" };
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(size - 1, end);
    if (start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const body = Readable.toWeb(createReadStream(full, { start, end })) as ReadableStream;
    return new Response(body, {
      status: 206,
      headers: { ...base, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const body = Readable.toWeb(createReadStream(full)) as ReadableStream;
  return new Response(body, { headers: { ...base, "Content-Length": String(size) } });
}
