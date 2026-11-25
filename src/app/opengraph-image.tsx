import { readFile } from "node:fs/promises";
import path from "node:path";
import { OG_SIZE } from "@/lib/og";

export const alt = "Yumi Mix — sua casa mais organizada para o Natal";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

// preview do site (vale para todas as páginas sem preview próprio): o banner da campanha atual
const BANNER = "banners/natal-organizada.webp";

export default async function Image() {
  const { default: sharp } = await import("sharp");
  const bytes = await readFile(path.join(/* turbopackIgnore: true */ process.cwd(), "public", BANNER));
  const jpeg = await sharp(bytes)
    .resize(size.width, size.height, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
