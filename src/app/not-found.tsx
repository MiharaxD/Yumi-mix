import Link from "next/link";
import { IconeSeta } from "@/components/Icones";

/** 404 no visual da loja (o padrão do Next segue o modo escuro do sistema e sai preto). */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6">
      <p className="titulo text-[5rem] leading-none text-cinza sm:text-[6rem]" aria-hidden>
        404
      </p>
      <h1 className="titulo mt-4 text-[2.25rem] leading-[1.02] sm:text-[3.25rem]">
        Essa página <span className="italico">saiu da parede.</span>
      </h1>
      <p className="mt-6 max-w-prose text-base leading-relaxed text-tinta-suave sm:text-lg">
        O endereço pode estar errado ou a peça não está mais à venda. Dá uma olhada no que está em pronta entrega.
      </p>
      <Link href="/#pecas" className="botao-principal mt-8 w-full px-6 py-4 sm:w-auto sm:self-start">
        Ver as peças <IconeSeta className="size-4" />
      </Link>
    </div>
  );
}
