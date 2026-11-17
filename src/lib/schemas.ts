import { z } from "zod";
import { MAX_QUANTITY_PER_ITEM } from "@/config";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const cartItemSchema = z.object({
  variantId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
});

export const cartItemsSchema = z.array(cartItemSchema).max(50);

const req = (msg: string) => z.string({ error: msg });

const onlyDigits = (v: string) => v.replace(/\D/g, "");

export const checkoutSchema = z.object({
  customerName: req("Informe seu nome completo.").trim().min(3, "Informe seu nome completo.").max(120),
  email: req("Informe seu email.").trim().toLowerCase().pipe(z.email("Confira o email: parece incompleto.")),
  whatsapp: req("Informe seu WhatsApp com DDD.")
    .transform(onlyDigits)
    .pipe(z.string().regex(/^\d{10,11}$/, "WhatsApp com DDD: 10 ou 11 números.")),
  cep: req("Informe o CEP.")
    .transform(onlyDigits)
    .pipe(z.string().regex(/^\d{8}$/, "O CEP tem 8 números.")),
  street: req("Informe a rua.").trim().min(2, "Informe a rua.").max(160),
  streetNumber: req("Informe o número (ou s/n).").trim().min(1, "Informe o número (ou s/n).").max(20),
  city: req("Informe a cidade.").trim().min(2, "Informe a cidade.").max(100),
  uf: z.enum(UFS, { error: "Escolha a UF." }),
  deliveryMethod: z.enum(["retirada", "entrega"], { error: "Escolha retirada ou entrega." }),
  items: cartItemsSchema.min(1, "Seu carrinho está vazio."),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
