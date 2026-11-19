import { readFile } from "node:fs/promises";
import path from "node:path";

// tamanho padrão de preview de link (WhatsApp, Instagram, Facebook, X)
export const OG_SIZE = { width: 1200, height: 630 };

export const OG_CORES = {
  papel: "#f5f5f3",
  branco: "#ffffff",
  tinta: "#17181c",
  tintaSuave: "#5c606a",
  dourado: "#b8955a",
  douradoClaro: "#f3ead9",
};

const TIPOS: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };

/** Lê um arquivo de `public/` e devolve como data URI (o ImageResponse não busca URLs relativas). */
export async function publicDataUri(publicPath: string): Promise<string> {
  const file = path.join(process.cwd(), "public", publicPath.replace(/^\/+/, ""));
  const bytes = await readFile(file);
  const tipo = TIPOS[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  return `data:${tipo};base64,${bytes.toString("base64")}`;
}

/** URL base pública: APP_URL ou o domínio do Railway. */
export function siteUrl(): URL | undefined {
  const base = process.env.APP_URL?.trim() || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "");
  try {
    return base ? new URL(base) : undefined;
  } catch {
    return undefined;
  }
}

/** Converte o PNG do ImageResponse em JPEG leve: o WhatsApp ignora previews muito pesados (~600 KB). */
export async function comoJpeg(png: Response): Promise<Response> {
  // import dinâmico: o layout usa siteUrl e não precisa carregar o sharp
  const { default: sharp } = await import("sharp");
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
