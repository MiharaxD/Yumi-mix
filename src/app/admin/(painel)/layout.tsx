import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { LogoYumiMix } from "@/components/Logo";
import { logoutAction } from "../actions";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel Yumi Mix" }, robots: { index: false } };

/** Avisos das últimas 24 h, para o selo do menu. */
function last24h() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

export default async function PainelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const recent = await prisma.notification.count({ where: { createdAt: { gte: last24h() } } });

  return (
    <>
      <header className="bg-tinta text-branco">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3 text-branco">
            <LogoYumiMix className="h-6 w-auto" />
            <span className="h-5 w-px bg-branco/30" aria-hidden />
            <span className="titulo font-extrabold text-branco">Painel</span>
          </Link>
          <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
            <AdminNav unread={recent} />
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link href="/" className="rounded-full px-3.5 py-2 text-papel transition-colors hover:bg-branco/10">
              Ver loja
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-full px-3.5 py-2 text-papel transition-colors hover:bg-branco/10">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
