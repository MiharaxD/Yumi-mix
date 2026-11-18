import Link from "next/link";

/** Chips de categoria abaixo do cabeçalho, roláveis no celular. */
export function CategoryNav({ categorias }: { categorias: { slug: string; name: string }[] }) {
  const itens = [
    { href: "/#pecas", nome: "Todas as peças" },
    ...categorias.map((c) => ({ href: `/categoria/${c.slug}`, nome: c.name })),
    { href: "/personalizado", nome: "Sob medida" },
  ];
  return (
    <nav aria-label="Categorias">
      <ul className="trilho mx-auto flex max-w-7xl scroll-px-4 gap-2 overflow-x-auto px-4 pt-1 pb-3 sm:scroll-px-6 sm:px-6">
        {itens.map((i) => (
          <li key={i.href} className="shrink-0">
            <Link href={i.href} className="pilula bg-branco shadow-cartao hover:bg-tinta hover:text-branco">
              {i.nome}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
