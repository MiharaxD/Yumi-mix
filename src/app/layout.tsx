import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { STORE_NAME } from "@/config";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: `${STORE_NAME} — decoração impressa em 3D`, template: `%s · ${STORE_NAME}` },
  description: "Peças de decoração e casa impressas em 3D pelo ateliê Yumi Mix. Pronta entrega ou sob encomenda.",
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
