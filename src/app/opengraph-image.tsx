import { ImageResponse } from "next/og";
import { OG_CORES as C, OG_SIZE, comoJpeg, publicDataUri } from "@/lib/og";

export const alt = "Yumi Mix — decoração e organização para a sua casa";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

// cartão de preview do site (vale para todas as páginas sem preview próprio)
export default async function Image() {
  const [logo, foto] = await Promise.all([
    publicDataUri("/brand/yumi-mix-horizontal-dourado.svg"),
    publicDataUri("/produtos/kit_saboneteira_de_parede_2_ganchos_adesivo_sem_fu/main_images/2.jpg"),
  ]);

  return comoJpeg(
    new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.papel, padding: 40, gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "28px 8px 28px 28px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={300} height={152} alt="" style={{ objectFit: "contain", objectPosition: "left" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 64, fontWeight: 700, lineHeight: 1.02, color: C.tinta, letterSpacing: -1.5 }}>
              <span>Sua casa mais</span>
              <span style={{ color: C.tintaSuave }}>organizada e charmosa</span>
            </div>
            <div style={{ display: "flex", fontSize: 28, color: C.tintaSuave }}>Decoração e organização para a casa</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["Pronta entrega", "Entrega para todo o Brasil"].map((t) => (
              <div key={t} style={{ display: "flex", background: C.branco, color: C.tinta, fontSize: 22, padding: "10px 22px", borderRadius: 999, flexShrink: 0, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(23,24,28,0.08)" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", width: 550, height: 550, borderRadius: 36, overflow: "hidden", background: C.branco, boxShadow: "0 18px 40px rgba(23,24,28,0.14)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} width={550} height={550} alt="" style={{ objectFit: "cover" }} />
        </div>
      </div>
    ),
    size,
    ),
  );
}
