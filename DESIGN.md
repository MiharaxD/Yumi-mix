---
name: Yumi Mix
description: Loja de decoração impressa em 3D apresentada como uma galeria de arte contemporânea, em preto e branco.
colors:
  papel: "#f5f4f0"
  branco: "#ffffff"
  nevoa: "#e9e8e2"
  cinza: "#cfcec7"
  tinta: "#121212"
  tinta-suave: "#595954"
  erro: "#a3341f"
  erro-fundo: "#f6e2dc"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "5rem"
    fontWeight: 800
    lineHeight: 0.9
    fontVariation: "'wdth' 62"
  display-italic:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: 300
    fontStyle: italic
    lineHeight: 1.05
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 800
    lineHeight: 0.95
    fontVariation: "'wdth' 62"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'tnum'"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.08em"
    textTransform: uppercase
rounded:
  none: "0px"
  swatch: "9999px"
spacing:
  linha: "1px"
  gutter: "16px"
  gutter-sm: "24px"
  container: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.branco}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.tinta}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    border: "1px solid {colors.tinta}"
  painel:
    backgroundColor: "{colors.branco}"
    border: "1px solid {colors.tinta}"
    rounded: "{rounded.none}"
  input:
    backgroundColor: "{colors.branco}"
    border: "1px solid rgb(18 18 18 / 0.3)"
    rounded: "{rounded.none}"
    padding: "12px 14px"
---

# Design System: Yumi Mix

## Overview

**Creative North Star: "A Galeria"** (referência: e-shop da Zoumboulakis Galleries).

A loja é uma galeria de arte contemporânea: parede clara (papel), peças expostas em molduras brancas, tinta preta e linhas finas de 1px que dividem a tela em células, como plantas de arquitetura. A cor vem só das peças e das fotos; a interface é preto e branco. Geometria reta, sem sombras e sem cantos arredondados.

**Key Characteristics:**
- Cabeçalho em células: marca | navegação central em caixa alta | célula do carrinho com ícone e legenda. Faixa preta fina acima.
- Hero dividido: foto de ambiente com título sobreposto à esquerda; "Destaques" com trilho de cards e setas em células à direita.
- Grade de peças com linhas de 1px compartilhadas (`.grade`), não cards flutuando.
- Lista de nomes em linhas; a linha ativa inverte para preto com seta e mostra a peça ao lado.
- Títulos em pares: condensado pesado + itálico leve ("Peças para / *a sua casa*").

## Colors
- **Papel** (papel): fundo de página e de células. **Branco** (branco): molduras, painéis, campos, cabeçalho.
- **Tinta** (tinta): texto, todas as linhas, botão principal, selo "Pronta entrega", rodapé, foco. **Tinta Suave** (tinta-suave): texto secundário (contraste ≥ 4.5:1 sobre papel).
- **Névoa / Cinza**: tons de apoio só no admin (status) e em esqueletos de carregamento.
- **Erro / Fundo de Erro**: validação e status cancelado/recusado.

**The Preto e Branco Rule.** Nenhuma cor de marca na interface. Cor só aparece nas fotos das peças e nas amostras de cor das variantes (únicos elementos redondos).

## Typography
Uma família só: Archivo variável (`next/font`, normal + itálico, eixo `wdth`).
- **Título** (`.titulo`): wdth 62, 800, entrelinha 0.9–0.95, balanceado. Página: 2.75rem → 4rem; seção: 2.5rem → 3.5rem; painel/legenda: 1.75rem.
- **Itálico** (`.italico`): 300 itálico, largura normal; sempre como segunda linha de um título.
- **Rótulo** (`.rotulo`): 0.75rem, 600, caixa alta, tracking 0.08em — navegação, rótulos de campo, botões, termos de ficha técnica.
- **Corpo**: 1rem, 1.6, números tabulares. Marca no cabeçalho em Archivo 300.

## Layout
Contêiner de 80rem (`max-w-7xl`), margem 16px → 24px. Seções separadas por linhas de 1px que vão de borda a borda; dentro delas, colunas divididas por linhas verticais. Grade de peças: 2 colunas no celular, 3 a partir de `lg`. Ritmo vertical: 64px celular, 96px desktop.

**The Linha Fina Rule.** Separação é sempre uma linha de 1px em tinta (ou tinta/15–30 dentro de painéis), nunca sombra ou espaço colorido.

## Components
- **Botão principal** (`.botao-principal`): bloco preto, rótulo branco em caixa alta, seta; hover inverte para branco com contorno e a seta avança 4px. **Contorno** (`.botao-contorno`): o inverso. Um botão principal por tarefa.
- **Painel** (`.painel`): branco, moldura 1px tinta, cantos retos. Formulários, resumos, avisos.
- **Moldura** (`.moldura` + `ImagemPeca`): fundo branco; vista frontal inteira com respiro (`inteira`), cena preenchendo (`inteira={false}`). Foto cresce 5% em 700ms no hover (`.foto-viva`).
- **Variante** (`.chip-variante`): célula com contorno tinta/30, amostra redonda; escolhida ganha contorno duplo em tinta.
- **Selos**: "Pronta entrega" preto com ponto branco; "N dias úteis" com contorno. Caixa alta 0.6875rem.
- **Campos**: branco, borda tinta/30 → tinta no foco, rótulo `.rotulo` acima, erro abaixo via `aria-describedby`.
- **Destaques** (`Destaques`): trilho com scroll-snap, setas em células 56px e linha de progresso.
- **Lista de peças** (`ListaPecas`): linhas `.linha-lista`; ativa (`data-ativa`) fica preta; prévia só a partir de `lg`.

## Motion
Curva `--ease-galeria` (cubic-bezier(0.22, 1, 0.36, 1)). Cor 200ms; deslocamentos 250–300ms; foto 700ms; entrada `.surgir` 900ms com `--atraso`. Tudo que se move de verdade fica dentro de `prefers-reduced-motion: no-preference`.

## Do's and Don'ts
- **Do** dividir com linhas de 1px e manter cantos retos em tudo, exceto amostras de cor.
- **Do** escrever títulos em par condensado + itálico nas seções da vitrine.
- **Do** manter preço ("a partir de") e prazo visíveis em todo card de peça.
- **Don't** usar sombra, gradiente decorativo (exceto o véu escuro sobre a foto do hero), cor de marca ou cantos arredondados.
- **Don't** introduzir outra família tipográfica, dependência de animação (GSAP etc.) ou modo escuro.
