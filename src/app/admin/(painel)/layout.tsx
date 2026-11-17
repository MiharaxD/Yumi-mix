import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { Marca } from "@/components/Icones";
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
          <Link href="/admin" className="flex items-center gap-2.5 text-branco">
            <Marca className="size-7" />
            <span className="titulo font-extrabold text-branco">Painel</span>
          </Link>
          <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
            <AdminNav unread={recent} />
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link href="/" className="px-3 py-2 text-papel hover:bg-tinta-suave">
              Ver loja
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="px-3 py-2 text-papel hover:bg-tinta-suave">
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
