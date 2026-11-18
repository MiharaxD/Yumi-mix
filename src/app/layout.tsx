import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { STORE_NAME } from "@/config";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: { default: `${STORE_NAME} — decoração e organização para a sua casa`, template: `%s · ${STORE_NAME}` },
  description: "Peças de decoração e organização para a casa, com pronta entrega pela loja Yumi Mix.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
