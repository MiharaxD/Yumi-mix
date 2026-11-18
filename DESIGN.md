---
name: Yumi Mix
description: Loja clara de decoração e organização para a casa; cartões brancos bem arredondados flutuando sobre um chão névoa, no capricho de Apple Store e Allbirds.
colors:
  papel: "#f5f5f3"
  branco: "#ffffff"
  nevoa: "#ececea"
  cinza: "#d9d9d5"
  tinta: "#17181c"
  tinta-hover: "#2b2d33"
  tinta-suave: "#5c606a"
  linha: "rgb(23 24 28 / 0.09)"
  dourado: "#b8955a"
  dourado-claro: "#f3ead9"
  erro: "#b3261e"
  erro-fundo: "#fdecea"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.25rem"
    fontWeight: 750
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'tnum'"
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  button:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 650
rounded:
  campo: "14px"
  chip: "16px"
  foto: "20px"
  cartao: "28px"
  palco: "32px"
  pilula: "999px"
spacing:
  grade: "12px"
  grade-sm: "20px"
  gutter: "16px"
  gutter-sm: "24px"
  secao: "64px"
  secao-sm: "96px"
  container: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.branco}"
    typography: "{typography.button}"
    rounded: "{rounded.pilula}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.tinta-hover}"
  button-outline:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.tinta}"
    typography: "{typography.button}"
    rounded: "{rounded.pilula}"
    padding: "14px 24px"
  button-outline-hover:
    backgroundColor: "{colors.nevoa}"
  button-round:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pilula}"
    size: "44px"
  pill-nav:
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.pilula}"
    padding: "8px 15px"
  pill-nav-active:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.branco}"
  painel:
    backgroundColor: "{colors.branco}"
    rounded: "{rounded.cartao}"
  cartao-peca:
    backgroundColor: "{colors.branco}"
    rounded: "{rounded.cartao}"
    padding: "8px"
  chip-variante:
    backgroundColor: "{colors.branco}"
    rounded: "{rounded.chip}"
  input:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
    padding: "14px 16px"
  input-focus:
    backgroundColor: "{colors.branco}"
---

# Design System: Yumi Mix

## Overview

**Creative North Star: "A Loja Clara"** (régua de capricho: Apple Store e Allbirds).

Uma loja de casa clara e confiável: fotos grandes em cartões brancos bem arredondados que flutuam sobre um chão névoa, muito respiro e sombra macia no lugar de linhas. Grafite no texto e na ação principal; o dourado da marca aparece só no logo e em pequenos detalhes. A vitrine persuade (hero de ambiente, destaques, coleções, faixa escura "sob medida"); carrinho, checkout e pagamento usam o mesmo material com contenção: painéis brancos, um botão grafite por tarefa.

**Key Characteristics:**
- Chão névoa, superfícies brancas com sombra em duas camadas, nenhuma linha divisória.
- Cantos generosos: 28px em cartões e painéis, 32px nos palcos escuros (hero, faixa sob medida, topo do rodapé), pílula em botões e navegação.
- Uma família, Figtree; títulos 750 com tracking fechado e segunda parte em tom suave.
- Cabeçalho branco translúcido (papel/80 + blur) com navegação em pílula e sacola pílula grafite com contador.
- Movimento só em CSS: cartão que sobe, check que se desenha, contador que pulsa.

## Colors

Neutros quentes quase brancos, grafite profundo e um dourado discreto.

### Primary
- **Grafite** (tinta): texto, botão principal, pílula ativa, sacola, palcos escuros (hero, sob medida, rodapé), foco. Hover do botão em **Grafite Aceso** (tinta-hover).

### Secondary
- **Dourado da Marca** (dourado): logo, pontos da faixa de garantias, contador da sacola com itens, números dos passos do sob medida, cursor de texto.
- **Champanhe** (dourado-claro): fundo de ícones de garantia, avisos de confirmação ("adicionado"), seleção de texto, hover do botão claro.

### Neutral
- **Névoa Clara** (papel): chão da página, fundo dos campos e da caixa de total. **Branco** (branco): cartões, painéis, chips.
- **Névoa** (nevoa): faixa de garantias, fundo das molduras, hover de pílula e contorno. **Cinza** (cinza): barra de rolagem.
- **Grafite Suave** (tinta-suave): texto secundário, dicas, placeholders. **Contorno** (linha): contorno interno de chip em repouso.
- **Erro / Fundo de Erro**: validação por campo e status recusado.

**The Dourado de Detalhe Rule.** Dourado é ponto, preenchimento de selo ou fundo de ícone, sempre com texto grafite por cima; nunca cor de texto, de link ou de botão principal.

## Typography

**Fonte única:** Figtree (`next/font`), com ui-sans-serif e system-ui de reserva. Números tabulares no corpo inteiro.

### Hierarchy
- **Display** (750, 2.75rem → 4.25rem, 0.98): título do hero, branco sobre foto.
- **Headline** (750, 2.25rem → 3.25rem, 1.02): títulos de seção da vitrine e faixa sob medida.
- **Title** (750, 1.75rem → 2.125rem, 1.05): título de painel ("Destaques"), nome de coleção, total. Categoria: 1.5rem → 1.875rem.
- **Body** (400, 1rem, 1.6): texto corrido, `max-w-prose`; nome de peça no cartão 0.9375rem → 1rem, 600.
- **Label** (600, 0.875rem, 1.25): rótulo de campo, pílulas, termos de ficha. Botões 0.9375rem, 650. Selos 0.6875rem → 0.75rem, 600.

**The Título em Dois Tons Rule.** Todo título usa 750, tracking -0.035em e quebra balanceada; a segunda parte vem no mesmo peso em tom suave (`.italico`, currentColor a 52%), que funciona em fundo claro e escuro. Não há itálico de verdade nem segunda família.

## Layout

Contêiner de 80rem, margem 16px → 24px. Seções da vitrine com 64px → 96px de topo; categorias separadas por 56px → 80px. Grade de cartões com respiro de 12px → 20px; 2 colunas no celular, 3 a partir de `lg`. Hero em duas colunas no desktop (1.35fr | 1fr): cartão de ambiente + painel "Destaques" com trilho rolável (scroll-snap, sem barra, setas redondas). Telas de operação: formulário em painel + resumo em painel ao lado.

**The Espaço e Superfície Rule.** Separação é feita por espaço, mudança de superfície (papel ↔ branco ↔ grafite) e sombra; nunca por linhas divisórias, bordas ou `divide-*`.

## Elevation & Depth

Camadas com sombra macia: o chão é plano, as superfícies brancas flutuam e sobem ao responder ao cursor. Sombras sempre em grafite translúcido, desfocadas e projetadas para baixo; os valores exatos estão no sidecar.

- **Cartão** (repouso de painel, cartão, pílula de categoria, botão redondo).
- **Alto** (cartão sob o cursor).
- **Botão** (sombra própria da pílula grafite, que se abre no hover).

**The Sobe ao Toque Rule.** Só o que é clicável sobe: cartão de peça e de coleção sobem 4px e trocam para a sombra alta; o botão principal sobe 1px e afunda (scale 0.98) ao pressionar.

## Shapes

Tudo arredondado e sem contorno. Raio 28px em cartões e painéis, 20px em molduras de foto e itens internos, 16px em chips e caixas de aviso, 14px em campos, 32px nos palcos grandes, pílula em botões, navegação, selos e contadores. Contornos, quando existem, são sombras internas de 1.5–2px (chip, botão contorno, campo em foco).

## Components

### Buttons
- **Principal** (`.botao-principal`): pílula grafite, texto branco, seta que avança 3px no hover; um por tarefa. Desabilitado a 45%.
- **Contorno** (`.botao-contorno`): pílula branca com contorno interno suave; hover névoa.
- **Claro** (só sobre foto e faixa escura): pílula branca com hover champanhe; par translúcido (branco/15 + blur).
- **Redondo** (`.botao-redondo`): 44px, branco com sombra; hover inverte para grafite.

### Chips
- **Variante e entrega** (`.chip-variante`): branco, raio 16px, contorno interno de 1.5px; escolhido ganha contorno grafite de 2px + sombra.
- **Selo de prazo**: pílula branca/95 sobre a foto; "Pronta entrega" com ponto verde, prazo com relógio.

### Cards / Containers
- **Painel** (`.painel`): branco, 28px, sombra cartão; formulários, resumos, garantias.
- **Cartão de peça** (`ProductTile`): moldura quadrada de 20px dentro de cartão de 28px com 8–10px de respiro; nome, "a partir de", preço e bolinhas de cor embaixo.
- **Coleção**: foto cheia com véu grafite de baixo para cima, nome e seta redonda branca.

### Inputs / Fields
- **Estilo** (`Campo`): fundo papel, sem borda, raio 14px; hover névoa.
- **Foco**: fundo branco + contorno interno grafite de 2px.
- **Erro**: fundo de erro + contorno de 1.5px em erro, mensagem abaixo via `aria-describedby`.

### Navigation
- Cabeçalho sticky translúcido; links em pílula dentro de uma cápsula branca; ativa em grafite. Chips de categoria brancos em trilho rolável logo abaixo. Rodapé grafite com topo arredondado (32px) e links com sublinhado que corre (`.link-linha`).

### Fotos (`FotosPeca`)
Fotos empilhadas com dissolve de 900ms (a nova cobre a anterior, nunca passa pelo branco); no cartão, só com mouse, após 250ms e a cada 2,2s. A foto cresce 4% em 900ms no hover. Fotos de fornecedor com etiqueta impressa recebem `recorte`: aproximação de 1.3× pelo canto oposto para tirar o texto do quadro. O hero usa uma foto fixa de ambiente sem texto (`CENA_HERO`), com véu grafite.

### Movimento
Só CSS, curva `--ease-galeria`. Entradas (`.surgir`), check que se desenha (500ms), pulso do contador da sacola (600ms) e rolagem suave ficam dentro de `prefers-reduced-motion: no-preference`; o dissolve também desliga em reduced-motion.

## Do's and Don'ts

### Do:
- **Do** separar blocos com espaço e troca de superfície; painel branco sobre papel é a unidade.
- **Do** usar 28px em cartões e painéis, pílula em toda ação e navegação.
- **Do** escrever títulos em dois tons (`.titulo` + `.italico`) nas seções da vitrine.
- **Do** manter preço ("a partir de") e prazo visíveis em todo cartão de peça.
- **Do** aplicar `recorte` a toda foto de fornecedor que traga etiqueta de texto.
- **Do** confirmar "adicionado" com o check que se desenha e o pulso do contador.

### Don't:
- **Don't** usar linhas divisórias, bordas de 1px ou cantos retos.
- **Don't** usar dourado como cor de texto ou na ação principal.
- **Don't** introduzir outra família tipográfica, rótulos em caixa alta acima de títulos ou biblioteca de animação.
- **Don't** criar modo escuro; os palcos grafite são superfícies, não um tema.
