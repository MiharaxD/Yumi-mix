@AGENTS.md

# Yumi Mix — loja de impressão 3D (versão de TESTE, deploy na Vercel)

Loja autoral de decoração impressa em 3D: catálogo → carrinho → checkout → pagamento **simulado** → painel admin, mais pedido personalizado com upload de fotos. Banco em Postgres hospedado (Neon), compartilhado entre dev local e produção; fora isso, nenhum serviço externo (pagamento continua simulado).
Stack: Next.js 16.4 (App Router, Turbopack, `cacheComponents` desligado) · React 19.3 · TypeScript 5 · Tailwind 4.3 · Prisma **6.19** + Postgres (Neon) · zod 4 · vitest 5. Node 20.19+ (testado no 24).

## Comandos
- Instalar: `npm install` (o `postinstall` roda `prisma generate`)
- Banco do zero: `npm run db:setup` (migrate deploy + seed) · recarregar catálogo: `npm run db:seed`
- Rodar: `npm run dev` → http://localhost:3000 (admin em /admin)
- Validar: `npm run build` · `npm run lint` · `npm test`
- Nova migração: `npx prisma migrate dev --name <nome>` (pare o `npm run dev` antes: no Windows ele trava a DLL do Prisma)
- Só com pedido explícito: `npx prisma migrate reset` (apaga o banco), qualquer comando que acesse rede além de `npm install`.

## Invariantes
- Preço é SEMPRE recalculado no servidor a partir do banco (`src/lib/cart-server.ts`); o navegador só manda `variantId` + quantidade.
- Pagamento só via interface `PaymentProvider`; aprovação idempotente (Notification com `key` única). Rota `/api/pagamentos/simular` só fora de produção.
- Uploads em `./uploads` (fora de `public/`), servidos só por `/api/admin/uploads/[id]` com sessão de admin; tipo validado pelos bytes.
- Transições de status só pelas funções de `src/lib/status.ts`.
- Dinheiro em centavos (Int). Endereço sempre obrigatório no checkout.
- Fora de escopo (não adicionar sem pedido): SDK de pagamento real, email/Telegram, login de cliente, cupons, avaliações, dark mode, i18n.
- Dependências travadas: next, react, typescript, tailwindcss, eslint, prisma/@prisma/client, zod, vitest. Qualquer outra: perguntar antes.
- Segredos em `.env.local` (admin) e `.env` (`DATABASE_URL`/`DATABASE_URL_UNPOOLED` — o Prisma CLI só lê `.env`); nomes em `.env.example`. Nunca commitar `.env`, `.env.local`, `uploads/`.
- Visual: seguir `DESIGN.md` (loja clara e arredondada: cartões brancos com sombra macia, botões em pílula, sem linhas divisórias, dourado só em detalhes). Produto/público em `PRODUCT.md`.

## Estilo
- Interface e mensagens de erro em pt-BR, tratando por "você"; código e identificadores em inglês, comentários em pt-BR curtos.
- Valores BRL via `formatBRL` (`src/lib/money.ts`). Validação com zod, erros por campo.
- Componentes de servidor por padrão; `"use client"` só onde há estado/efeito. Páginas com banco usam `export const dynamic = "force-dynamic"`.

## Protocolo de consulta (antes de qualquer tarefa)
1. Leia `docs/context/ROUTES.md` e vá direto aos caminhos do tipo de tarefa.
2. Leia `docs/context/STATE.md` e `docs/context/DECISIONS.md` só se a tarefa depender de estado, prioridades ou escolhas de produto.
3. Explore além disso só se a rota não cobrir o caso. Em arquivo grande, use busca e leia trechos.

## Protocolo de manutenção (ao terminar trabalho relevante, sem precisar pedir)
- Atualize só os documentos afetados, antes de declarar a tarefa concluída.
- Substitua em vez de acrescentar: remova o obsoleto, pendências concluídas e redundâncias.
- Descobriu caminho novo ou rota errada? Corrija o `ROUTES.md`.
- Nunca registre diário, log de sessão, raciocínio, SHAs, resultados de teste datados ou tamanhos de build.
- Respeite os limites de tamanho (~1.500–2.000 tokens por arquivo); perto disso, compacte.
- Instruções novas do usuário prevalecem; atualize os documentos quando mudarem uma regra.
