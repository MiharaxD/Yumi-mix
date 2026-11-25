"use client";

import { useEffect, useState } from "react";
import { IconeSeta } from "@/components/Icones";
import type { Loja } from "@/lib/lojas";

// mesmo anúncio em vários links: cada clique abre o próximo (vez guardada no navegador)
export function BotaoLoja({ loja, compacto = false }: { loja: Loja; compacto?: boolean }) {
  const { urls, marca } = loja;
  const chave = `yumi-link:${urls[0]}`;
  const [vez, setVez] = useState(0);
  const href = urls[vez % urls.length];
  const rotulo = `Comprar ${loja.prefixo} ${marca.nome}${loja.promocao ? ", em promoção" : ""}`;

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
          ? "botao-loja relative min-w-0 gap-1.5 px-3 py-2 text-[0.8125rem] shadow-[0_6px_14px_-8px_rgb(23_24_28/0.45)]"
          : "botao-loja relative min-w-0 px-5 py-3 text-center"
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
      {loja.promocao && (
        <span
          aria-hidden
          className={`absolute right-3 rounded-full bg-tinta font-bold tracking-wide text-branco uppercase shadow-[0_4px_10px_-4px_rgb(23_24_28/0.5)] ${
            compacto ? "-top-2 px-1.5 py-px text-[0.5625rem] max-sm:right-1/2 max-sm:translate-x-1/2" : "-top-2.5 px-2 py-0.5 text-[0.6875rem]"
          }`}
        >
          Promoção
        </span>
      )}
      {compacto ? (
        <span aria-hidden className="truncate max-sm:hidden">
          {marca.nome}
        </span>
      ) : (
        <>
          Comprar {loja.prefixo} {marca.nome}
          {loja.promocao && <span className="sr-only">, em promoção</span>}
          <IconeSeta className="size-4 shrink-0" />
          <span className="sr-only"> (abre em nova aba)</span>
        </>
      )}
    </a>
  );
}
