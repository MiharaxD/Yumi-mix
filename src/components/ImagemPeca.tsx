import Image from "next/image";

/**
 * Imagem de peça dentro de uma `.moldura`.
 * `inteira`: a peça inteira com respiro em volta (nada é cortado).
 * Sem `inteira`: a foto preenche a moldura (cenas/ambientes).
 */
export function ImagemPeca({
  src,
  alt,
  sizes,
  inteira = true,
  priority = false,
  respiro = "inset-[10%]",
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  inteira?: boolean;
  priority?: boolean;
  respiro?: string;
  className?: string;
}) {
  if (!inteira) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} unoptimized />;
  }
  return (
    <span className={`absolute block ${respiro}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-contain ${className}`} unoptimized />
    </span>
  );
}
