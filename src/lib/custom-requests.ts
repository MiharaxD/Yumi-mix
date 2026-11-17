import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { FIRST_CUSTOM_REQUEST_NUMBER } from "@/config";

const req = (msg: string) => z.string({ error: msg });

export const customRequestSchema = z.object({
  name: req("Informe seu nome.").trim().min(2, "Informe seu nome.").max(120),
  contact: req("Informe um WhatsApp ou email.")
    .trim()
    .min(5, "Informe um WhatsApp ou email para a gente responder.")
    .max(160),
  description: req("Descreva a peça.").trim().min(10, "Conte um pouco mais sobre a peça (mín. 10 caracteres).").max(3000),
  dimensions: req("Informe as medidas.").trim().min(1, "Informe as medidas aproximadas.").max(120),
  materialColor: req("Informe material ou cor.").trim().min(1, "Diga o material ou a cor que imagina.").max(120),
  quantity: z.coerce
    .number({ error: "Informe a quantidade." })
    .int("Use um número inteiro.")
    .min(1, "Pelo menos 1 unidade.")
    .max(500, "Para mais de 500 unidades, fale com a gente direto."),
  desiredDate: req("Informe o prazo desejado.").trim().min(1, "Informe o prazo desejado.").max(60),
});

export type CustomRequestData = z.output<typeof customRequestSchema>;

/** Cria a solicitação com status "nova" e as imagens já salvas em disco. */
export async function createCustomRequest(
  data: CustomRequestData,
  images: { filePath: string; mimeType: string; sizeBytes: number }[],
  id: string,
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const last = await tx.customRequest.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
        const number = Math.max(FIRST_CUSTOM_REQUEST_NUMBER, (last?.number ?? 0) + 1);
        return tx.customRequest.create({
          data: { id, number, status: "nova", ...data, images: { create: images } },
          select: { id: true, number: true },
        });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  throw new Error("Não foi possível numerar a solicitação.");
}
