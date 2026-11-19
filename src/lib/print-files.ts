import { createHmac, timingSafeEqual } from "node:crypto";
import { PRINT_LINK_HOURS } from "@/config";

// Link assinado para baixar o .3mf sem cookie: o Bambu Studio baixa o arquivo
// sozinho e não tem a sessão do admin. Só é gerado em páginas do admin.

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET ausente.");
  return s;
}

function sign(productId: string, exp: number): string {
  return createHmac("sha256", secret()).update(`print:${productId}:${exp}`).digest("base64url");
}

/** Token "<expira-em-segundos>.<assinatura>". */
export function createPrintToken(productId: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + PRINT_LINK_HOURS * 3600;
  return `${exp}.${sign(productId, exp)}`;
}

export function verifyPrintToken(productId: string, token: string, now = Date.now()): boolean {
  const [expRaw, sig] = token.split(".");
  if (!expRaw || !sig || !/^\d+$/.test(expRaw)) return false;
  const exp = Number(expRaw);
  if (exp * 1000 < now) return false;
  const expected = Buffer.from(sign(productId, exp));
  const got = Buffer.from(sig);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

/** Nome de arquivo seguro para a URL (o Bambu Studio usa o fim da URL como nome). */
export function safePrintName(name: string): string {
  const base = name.replace(/\.3mf$/i, "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  return `${base.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "peca"}.3mf`;
}

/** Caminho relativo da rota que serve o arquivo. */
export function printFilePath(productId: string, fileName: string, now = Date.now()): string {
  return `/api/arquivo-3d/${productId}/${createPrintToken(productId, now)}/${safePrintName(fileName)}`;
}

/** Link que abre direto no Bambu Studio (mesmo esquema do "Abrir no Bambu Studio" do MakerWorld). */
export function bambuStudioLink(absoluteUrl: string): string {
  return `bambustudioopen://${encodeURIComponent(absoluteUrl)}`;
}
