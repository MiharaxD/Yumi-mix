import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/catalog";
import { formatBRL } from "@/lib/money";
import { OG_CORES as C, OG_SIZE, publicDataUri } from "@/lib/og";

export const alt = "Peça da loja Yumi Mix";
export const size = OG_SIZE;
export const contentType = "image/png";

// preview do link de uma peça: foto + nome + preço
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const logo = await publicDataUri("/brand/yumi-mix-horizontal-dourado.svg");
  const fotoUrl = product?.images[0]?.url;
  const foto = fotoUrl?.startsWith("/") ? await publicDataUri(fotoUrl).catch(() => null) : null;
  const preco = product?.variants.length ? Math.min(...product.variants.map((v) => v.priceCents)) : null;
  const nome = product?.name ?? "Yumi Mix";

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.papel, padding: 40, gap: 44 }}>
        <div style={{ display: "flex", width: 550, height: 550, borderRadius: 36, overflow: "hidden", background: C.branco, boxShadow: "0 18px 40px rgba(23,24,28,0.14)" }}>
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} width={550} height={550} alt="" style={{ objectFit: "cover" }} />
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "28px 28px 28px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={220} height={112} alt="" style={{ objectFit: "contain", objectPosition: "left" }} />
          <div style={{ display: "flex", fontSize: nome.length > 60 ? 44 : 52, fontWeight: 700, lineHeight: 1.08, color: C.tinta, letterSpacing: -1 }}>
            {nome.length > 90 ? `${nome.slice(0, 88).trimEnd()}…` : nome}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {preco !== null ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, color: C.tinta }}>
                <span style={{ fontSize: 26, color: C.tintaSuave }}>a partir de</span>
                <span style={{ fontSize: 48, fontWeight: 700 }}>{formatBRL(preco)}</span>
              </div>
            ) : null}
            {product?.readyToShip ? (
              <div style={{ display: "flex", background: C.douradoClaro, color: C.tinta, fontSize: 22, padding: "10px 22px", borderRadius: 999, flexShrink: 0, whiteSpace: "nowrap" }}>Pronta entrega</div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
