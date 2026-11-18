import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LogoYumiMix } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid bg-papel flex-1 place-items-center px-4 py-16">
      <div className="painel w-full max-w-sm p-6 sm:p-8">
        <LogoYumiMix className="h-8 w-auto" />
        <h1 className="mt-5 text-2xl font-bold">Painel do ateliê</h1>
        <p className="mt-1 mb-5 text-sm text-tinta-suave">Pedidos, orçamentos e avisos.</p>
        <LoginForm />
      </div>
    </main>
  );
}
