import { streamUpload } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

/** Fotos e vídeos de produto enviados pelo admin (públicos). Só a pasta "produtos". */
export async function GET(request: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path } = await ctx.params;
  const [folder, file, ...rest] = path;
  const match = /^[0-9a-f-]{36}\.([a-z0-9]+)$/.exec(file ?? "");
  if (folder !== "produtos" || rest.length > 0 || !match || !TYPES[match[1]]) {
    return new Response("Não encontrado.", { status: 404 });
  }
  return streamUpload(`produtos/${file}`, request, {
    "Content-Type": TYPES[match[1]],
    // nome com uuid: o arquivo nunca muda
    "Cache-Control": "public, max-age=31536000, immutable",
  });
}
