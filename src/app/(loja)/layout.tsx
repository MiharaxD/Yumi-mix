import Link from "next/link";
import { STORE_NAME } from "@/config";
import { CartLink } from "@/components/CartLink";
import { Marca } from "@/components/Icones";

export default function LojaLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-tinta focus:px-4 focus:py-2 focus:text-branco"
      >
        Pular para o conteúdo
      </a>

      {/* faixa fina preta, como a barra de contato da galeria */}
      <div className="bg-tinta text-branco">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[0.6875rem] tracking-[0.06em] uppercase sm:px-6">
          <span>Ateliê de impressão 3D</span>
          <span className="hidden text-branco/70 sm:inline">Pronta entrega ou sob encomenda · Retirada grátis</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-tinta bg-branco">
        <div className="mx-auto flex h-16 max-w-7xl items-stretch sm:h-[4.5rem] sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-3 px-4 text-tinta sm:border-l sm:px-6 md:flex-none md:border-r md:border-tinta"
            aria-label={`${STORE_NAME}, página inicial`}
          >
            <Marca className="size-6 shrink-0 sm:size-7" />
            <span className="text-lg font-light tracking-[-0.01em] whitespace-nowrap sm:text-[1.375rem]">{STORE_NAME}</span>
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 items-center justify-center gap-9 md:flex">
            <Link href="/#pecas" className="rotulo link-linha pb-1">
              Peças
            </Link>
            <Link href="/#destaques" className="rotulo link-linha pb-1">
              Destaques
            </Link>
            <Link href="/personalizado" className="rotulo link-linha pb-1">
              Sob medida
            </Link>
          </nav>

          <div className="flex items-stretch">
            <Link
              href="/personalizado"
              className="flex items-center border-l border-tinta px-4 text-[0.6875rem] font-semibold tracking-[0.06em] uppercase transition-colors hover:bg-tinta hover:text-branco md:hidden"
            >
              Sob medida
            </Link>
            <CartLink />
          </div>
        </div>
      </header>

      <main id="conteudo" className="flex-1">
        {children}
      </main>

      <footer className="bg-tinta text-branco">
        <div className="mx-auto grid max-w-7xl gap-px bg-branco/20 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="bg-tinta px-4 py-10 sm:px-6">
            <p className="flex items-center gap-3 text-2xl font-light">
              <Marca className="size-7" />
              {STORE_NAME}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-branco/70">
              Ateliê de impressão 3D. Cada peça sai da impressora camada por camada e é acabada à mão.
            </p>
          </div>
          <nav aria-label="Rodapé" className="flex flex-col gap-3 bg-tinta px-4 py-10 sm:px-6">
            <p className="rotulo text-branco/50">Loja</p>
            <Link href="/#pecas" className="link-linha self-start text-sm">
              Todas as peças
            </Link>
            <Link href="/personalizado" className="link-linha self-start text-sm">
              Peça sob medida
            </Link>
            <Link href="/carrinho" className="link-linha self-start text-sm">
              Carrinho
            </Link>
          </nav>
          <div className="bg-tinta px-4 py-10 sm:px-6">
            <p className="rotulo text-branco/50">Aviso</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-branco/70">
              Loja em modo de teste: nenhum pagamento é real e nada é enviado.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
