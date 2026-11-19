"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Pedidos", match: (p: string) => p === "/admin" || p.startsWith("/admin/pedidos") },
  { href: "/admin/produtos", label: "Produtos", match: (p: string) => p.startsWith("/admin/produtos") },
  { href: "/admin/frete", label: "Frete", match: (p: string) => p.startsWith("/admin/frete") },
  { href: "/admin/personalizados", label: "Sob medida", match: (p: string) => p.startsWith("/admin/personalizados") },
  { href: "/admin/notificacoes", label: "Avisos", match: (p: string) => p.startsWith("/admin/notificacoes") },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="-mx-1 flex gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              active ? "bg-nevoa text-tinta" : "text-papel hover:bg-branco/10"
            }`}
          >
            {l.label}
            {l.href === "/admin/notificacoes" && unread > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-dourado px-1.5 text-xs leading-5 text-tinta">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
