"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Foto = { url: string; alt: string };

/** Qual foto está na frente e qual ficou por baixo dela (para o dissolve não passar pelo branco). */
export function useFotoAtiva() {
  const [estado, setEstado] = useState<{ atual: number; anterior: number | null }>({ atual: 0, anterior: null });
  const atualRef = useRef(0);

  const ir = useCallback((i: number) => {
    if (i === atualRef.current) return;
    setEstado({ atual: i, anterior: atualRef.current });
    atualRef.current = i;
  }, []);

  return { ...estado, ir, atualRef };
}

/**
 * Ciclo de fotos sob o mouse: `entrar` monta as outras fotos e começa a passar,
 * `sair` volta para a primeira. Só avança para foto já carregada; desliga em reduced-motion.
 */
export function useCicloFotos(total: number, intervaloMs = 2200) {
  const { atual, anterior, ir, atualRef } = useFotoAtiva();
  const [montadas, setMontadas] = useState(false);
  const carregadas = useRef<boolean[]>([true]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parar = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const entrar = useCallback(() => {
    if (total < 2 || timer.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMontadas(true);
    const agendar = (ms: number) => {
      timer.current = setTimeout(() => {
        for (let k = 1; k < total; k++) {
          const j = (atualRef.current + k) % total;
          if (carregadas.current[j]) {
            ir(j);
            agendar(intervaloMs);
            return;
          }
        }
        agendar(120); // a próxima ainda está chegando
      }, ms);
    };
    agendar(250);
  }, [total, intervaloMs, ir, atualRef]);

  const sair = useCallback(() => {
    parar();
    ir(0);
  }, [parar, ir]);

  const marcarCarregada = useCallback((i: number) => {
    carregadas.current[i] = true;
  }, []);

  useEffect(() => parar, [parar]);

  return { atual, anterior, montadas, entrar, sair, marcarCarregada };
}

// fotos de fornecedor com etiqueta de texto no canto superior esquerdo: aproxima pelo canto oposto para tirá-la do quadro
const COM_ETIQUETA = ["/produtos/kit_3_ganchos_adesivos_para_parede_tolhas_cabide_m/"];
function recorte(url: string) {
  return COM_ETIQUETA.some((p) => url.startsWith(p)) ? "origin-bottom-right scale-[1.3]" : "";
}

function camada(i: number, atual: number, anterior: number | null) {
  // a nova surge por cima; a anterior fica opaca por baixo até a nova cobrir
  if (i === atual) return "z-[2] opacity-100 duration-[900ms]";
  if (i === anterior) return "z-[1] opacity-100 duration-[900ms]";
  return "z-0 opacity-0 duration-0 delay-[900ms]";
}

/** Fotos empilhadas na moldura, trocando por dissolve. Só a foto da vez é descrita; as outras ficam ocultas para leitor de tela. */
export function CamadasFotos({
  fotos,
  sizes,
  atual,
  anterior,
  montadas = true,
  priority = false,
  onCarregada,
}: {
  fotos: Foto[];
  sizes: string;
  atual: number;
  anterior: number | null;
  montadas?: boolean;
  priority?: boolean;
  onCarregada?: (i: number) => void;
}) {
  return fotos.map((f, i) =>
    i === 0 || montadas ? (
      <Image
        key={f.url}
        src={f.url}
        alt={i === atual ? f.alt : ""}
        aria-hidden={i === atual ? undefined : true}
        fill
        sizes={sizes}
        priority={priority && i === 0}
        onLoad={() => onCarregada?.(i)}
        draggable={false}
        className={`object-cover transition-opacity ease-in-out motion-reduce:transition-none ${recorte(f.url)} ${camada(i, atual, anterior)}`}
      />
    ) : null,
  );
}

/** Barrinhas arredondadas sobre a foto que contam as fotos e marcam a da vez. */
export function IndicadorFotos({ total, atual, className = "" }: { total: number; atual: number; className?: string }) {
  if (total < 2) return null;
  return (
    <span aria-hidden className={`flex gap-1 ${className}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-colors duration-300 ease-galeria ${i === atual ? "bg-branco" : "bg-branco/45"}`}
        />
      ))}
    </span>
  );
}
