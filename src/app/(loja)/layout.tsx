import Link from "next/link";
import { STORE_NAME, SOCIAL_LINKS } from "@/config";
import { CartLink } from "@/components/CartLink";
import { CategoryNav } from "@/components/CategoryNav";
import { LogoYumiMix } from "@/components/Logo";
import { listCategories } from "@/lib/catalog";
import { formatBRL } from "@/lib/money";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LojaLayout({ children }: LayoutProps<"/">) {
  const [categorias, settings] = await Promise.all([listCategories(), getStoreSettings()]);
  const freeAbove = settings.freeShippingThresholdCents;

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-tinta focus:px-4 focus:py-2 focus:text-branco"
      >
        Pular para o conteúdo
      </a>

      {/* faixa de garantias: o que a cliente precisa saber antes de escolher */}
      <div className="bg-nevoa text-tinta-suave">
        <p className="mx-auto flex max-w-7xl items-center justify-center gap-x-3 px-4 py-2 text-center text-xs font-medium sm:px-6 sm:text-[0.8125rem]">
          <span>Pronta entrega</span>
          <span aria-hidden className="size-1 rounded-full bg-dourado" />
          <span>Entrega para todo o Brasil</span>
          {freeAbove !== null && (
            <>
              <span aria-hidden className="hidden size-1 rounded-full bg-dourado sm:block" />
              <span className="hidden sm:inline">Frete grátis acima de {formatBRL(freeAbove)}</span>
            </>
          )}
        </p>
      </div>

      <header className="sticky top-0 z-40 bg-papel/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6">
          <Link href="/" className="flex min-w-0 flex-1 items-center md:flex-none" aria-label={`${STORE_NAME}, página inicial`}>
            <LogoYumiMix className="h-9 w-auto shrink-0 sm:h-10" />
          </Link>

          <nav aria-label="Principal" className="mx-auto hidden items-center gap-0.5 rounded-full bg-branco p-1 shadow-cartao md:flex">
            <Link href="/#destaques" className="pilula">
              Destaques
            </Link>
            <Link href="/#colecoes" className="pilula">
              Coleções
            </Link>
            <Link href="/personalizado" className="pilula">
              Sob medida
            </Link>
          </nav>

          <CartLink />
        </div>
      </header>

      <CategoryNav categorias={categorias} />

      <main id="conteudo" className="flex-1">
        {children}
      </main>

      <footer className="mt-10 rounded-t-[2rem] bg-tinta text-branco sm:mt-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-16">
          <div>
            <LogoYumiMix className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-branco/65">
              Decoração e organização para a sua casa, com pronta entrega.
            </p>
          </div>
          <nav aria-label="Rodapé" className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-branco/45">Loja</p>
            <Link href="/#pecas" className="link-linha self-start">
              Todas as peças
            </Link>
            <Link href="/personalizado" className="link-linha self-start">
              Peça sob medida
            </Link>
            <Link href="/carrinho" className="link-linha self-start">
              Carrinho
            </Link>
          </nav>
          <nav aria-label="Redes sociais" className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-branco/45">Redes</p>
            <a href={SOCIAL_LINKS.instagram} className="link-linha self-start" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={SOCIAL_LINKS.whatsapp} className="link-linha self-start" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </nav>
          <div className="rounded-cartao bg-branco/[0.06] p-5 text-sm">
            <p className="font-semibold">Loja em modo de teste</p>
            <p className="mt-1.5 leading-relaxed text-branco/65">Nenhum pagamento é real e nada é enviado.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
