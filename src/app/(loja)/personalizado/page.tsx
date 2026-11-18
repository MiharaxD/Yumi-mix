import type { Metadata } from "next";
import { CustomRequestForm } from "./CustomRequestForm";

export const metadata: Metadata = { title: "Peça sob medida" };

export default function PersonalizadoPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24 lg:grid-cols-[20rem_1fr] lg:gap-16">
      <div>
        <h1 className="titulo text-[2.25rem] leading-[1.02] sm:text-[3.25rem]">
          Peça sob medida. <span className="italico">Do seu jeito.</span>
        </h1>
        <p className="mt-4 max-w-prose text-lg text-tinta-suave">
          Mande uma foto ou um desenho do que você imagina. A gente estuda o pedido e responde com orçamento e prazo.
        </p>
        <ol className="mt-8 flex flex-col gap-2 text-sm">
          <li className="painel flex items-center gap-4 rounded-[1.25rem] px-4 py-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-dourado-claro text-sm font-bold">1</span>
            Você descreve a peça e manda as imagens.
          </li>
          <li className="painel flex items-center gap-4 rounded-[1.25rem] px-4 py-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-dourado-claro text-sm font-bold">2</span>
            Respondemos com preço e prazo.
          </li>
          <li className="painel flex items-center gap-4 rounded-[1.25rem] px-4 py-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-dourado-claro text-sm font-bold">3</span>
            Só confirmamos o pedido depois que você aprova.
          </li>
        </ol>
      </div>
      <CustomRequestForm />
    </div>
  );
}
