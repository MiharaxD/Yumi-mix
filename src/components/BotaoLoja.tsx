"use client";

import { useEffect, useState } from "react";
import { IconeSeta } from "@/components/Icones";

type Marca = { nome: string; fundo: string; texto: string; logo: string; logoLargura: number };
const MARCAS: Record<"ml" | "shopee", Marca> = {
  ml: { nome: "Mercado Livre", fundo: "#ffe600", texto: "#2d3277", logo: "/marcas/mercado-livre.png", logoLargura: 43 },
  shopee: { nome: "Shopee", fundo: "#ed4c2d", texto: "#ffffff", logo: "/marcas/shopee.png", logoLargura: 26 },
};

function separarLinks(valor: string | null | undefined): string[] {
  return (valor ?? "").split(/\s+/).filter(Boolean);
}

/** Lojas com link cadastrado, Mercado Livre primeiro. */
export function lojasDaPeca(shopeeUrl: string | null | undefined, mercadoLivreUrl: string | null | undefined) {
  return [
    { chave: "ml", prefixo: "no", urls: separarLinks(mercadoLivreUrl), marca: MARCAS.ml },
    { chave: "shopee", prefixo: "na", urls: separarLinks(shopeeUrl), marca: MARCAS.shopee },
  ].filter((l) => l.urls.length > 0);
}

export type Loja = ReturnType<typeof lojasDaPeca>[number];

// mesmo anúncio em vários links: cada clique abre o próximo (vez guardada no navegador)
export function BotaoLoja({ loja, compacto = false }: { loja: Loja; compacto?: boolean }) {
  const { urls, marca } = loja;
  const chave = `yumi-link:${urls[0]}`;
  const [vez, setVez] = useState(0);
  const href = urls[vez % urls.length];
  const rotulo = `Comprar ${loja.prefixo} ${marca.nome}`;

  useEffect(() => {
    if (urls.length < 2) return;
    let salva: number;
    try {
      salva = Number(localStorage.getItem(chave));
    } catch {
      salva = NaN;
    }
    // primeira visita: começa num link sorteado para dividir os acessos
    // eslint-disable-next-line react-hooks/set-state-in-effect -- só lê o navegador depois da hidratação
    setVez(Number.isInteger(salva) && salva >= 0 ? salva : Math.floor(Math.random() * urls.length));
  }, [chave, urls.length]);

  function avancar() {
    if (urls.length < 2) return;
    const prox = (vez + 1) % urls.length;
    try {
      localStorage.setItem(chave, String(prox));
    } catch {}
    // troca depois do clique para o navegador abrir o link atual
    setTimeout(() => setVez(prox), 0);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={avancar}
      onAuxClick={avancar}
      aria-label={compacto ? `${rotulo} (abre em nova aba)` : undefined}
      className={
        compacto
          ? "botao-loja min-w-0 gap-1.5 px-3 py-2 text-[0.8125rem] shadow-[0_6px_14px_-8px_rgb(23_24_28/0.45)]"
          : "botao-loja min-w-0 px-5 py-3 text-center"
      }
      style={{ backgroundColor: marca.fundo, color: marca.texto }}
    >
      {/* logo recortado com o próprio fundo da marca, por isso some no botão */}
      {/* eslint-disable-next-line @next/next/no-img-element -- logo pequeno, sem otimização */}
      <img
        src={marca.logo}
        alt=""
        width={marca.logoLargura}
        height={28}
        className={compacto ? "h-5 w-auto shrink-0" : "h-7 w-auto shrink-0"}
      />
      {compacto ? (
        <span aria-hidden className="truncate max-sm:hidden">
          {marca.nome}
        </span>
      ) : (
        <>
          {rotulo}
          <IconeSeta className="size-4 shrink-0" />
          <span className="sr-only"> (abre em nova aba)</span>
        </>
      )}
    </a>
  );
}
