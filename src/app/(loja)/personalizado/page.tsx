import type { Metadata } from "next";
import { CustomRequestForm } from "./CustomRequestForm";

export const metadata: Metadata = { title: "Peça sob medida" };

export default function PersonalizadoPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24 lg:grid-cols-[20rem_1fr] lg:gap-16">
      <div>
        <h1 className="leading-[0.95]"><span className="titulo block text-[2.75rem] sm:text-[4rem]">Peça sob medida</span><span className="italico block text-[1.75rem] sm:text-[2.25rem]">do seu jeito</span></h1>
        <p className="mt-4 max-w-prose text-lg text-tinta-suave">
          Mande uma foto ou um desenho do que você imagina. A gente estuda a impressão e responde com orçamento e prazo.
        </p>
        <ol className="mt-8 flex flex-col border-t border-tinta text-sm">
          <li className="flex items-center gap-4 border-b border-tinta py-3.5">
            <span className="grid size-7 shrink-0 place-items-center border border-tinta text-sm font-bold">1</span>
            Você descreve a peça e manda as imagens.
          </li>
          <li className="flex items-center gap-4 border-b border-tinta py-3.5">
            <span className="grid size-7 shrink-0 place-items-center border border-tinta text-sm font-bold">2</span>
            Respondemos com preço e prazo.
          </li>
          <li className="flex items-center gap-4 border-b border-tinta py-3.5">
            <span className="grid size-7 shrink-0 place-items-center border border-tinta text-sm font-bold">3</span>
            Só começamos a imprimir depois que você aprova.
          </li>
        </ol>
      </div>
      <CustomRequestForm />
    </div>
  );
}
