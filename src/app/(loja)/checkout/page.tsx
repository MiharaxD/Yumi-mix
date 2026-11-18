import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Finalizar compra" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
      <h1 className="titulo mb-8 text-[2.25rem] leading-[1.02] sm:mb-10 sm:text-[3.25rem]">Finalizar compra</h1>
      <CheckoutForm />
    </div>
  );
}
