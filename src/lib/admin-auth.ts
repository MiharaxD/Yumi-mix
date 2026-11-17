import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "ym_admin";
const SESSION_HOURS = 12;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("Defina ADMIN_SESSION_SECRET (mín. 32 caracteres) em .env.local.");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // compara hashes de tamanho fixo para não vazar o tamanho da senha
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

/** Valor do cookie: "<expira-em-ms>.<assinatura HMAC>". */
export function createSessionValue(now = Date.now()): string {
  const exp = String(now + SESSION_HOURS * 60 * 60 * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()): boolean {
  if (!value || !adminConfigured()) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < now) return false;
  return safeEqual(sig, sign(exp));
}

export async function startSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionValue(jar.get(ADMIN_COOKIE)?.value);
}

/** Use no topo de páginas e server actions do admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
