# Decisões ativas

- **Prisma fixado na 6.19 (não 7/8).** Por quê: a 7+ exige driver adapter para SQLite, que seria dependência fora da lista. Exige: não atualizar o Prisma sem aprovar o adapter.
- **`cacheComponents` desligado no `next.config.ts`.** Por quê: modelo de renderização clássico, mais simples para páginas com banco. Exige: `export const dynamic = "force-dynamic"` em páginas que leem o banco.
- **`build` não roda `prisma generate`.** Por quê: no Windows o dev server trava a DLL e o build falhava. Exige: gerar o client via `postinstall`/`npx prisma generate` com o dev parado.
- **Endereço sempre obrigatório no checkout, inclusive na retirada.** Por quê: escolha da dona da loja. Proíbe: tornar opcional sem pedido.
- **Número do pedido visível (#1001…) + id imprevisível na URL.** Por quê: a página de pagamento é pública e sem login. Proíbe: expor o número sequencial em rotas.
- **Carrinho misto mostra o maior prazo (envio junto).** Exige: `cartLeadTimeDays` como fonte única do prazo.
- **Frete: entrega R$ 20,00 fixa, grátis a partir de R$ 200,00; retirada grátis.** Valores em `src/config.ts`.
- **Voz da marca "próxima e caprichosa", produtos de decoração e casa.** Ver `PRODUCT.md`.
- **Mundo visual "A Galeria" (preto e branco, linhas de 1px, referência Zoumboulakis Galleries) pedido pela usuária, substituindo o antigo "Parede de Cobogó".** Fonte Archivo via `next/font` (normal + itálico, eixo `wdth`), baixada no build. Exige: seguir `DESIGN.md`; nenhum outro webfont/CDN; animações só em CSS (GSAP não é dependência aprovada).
