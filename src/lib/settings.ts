import { prisma } from "@/lib/db";

export type StoreSettingsData = {
  originCep: string;
  freeShippingThresholdCents: number | null;
  fallbackShippingCents: number;
  fallbackShippingDays: number;
};

/** Configuração da loja (linha única). Cria com os padrões na primeira leitura. */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  const s = await prisma.storeSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  return {
    originCep: s.originCep,
    freeShippingThresholdCents: s.freeShippingThresholdCents,
    fallbackShippingCents: s.fallbackShippingCents,
    fallbackShippingDays: s.fallbackShippingDays,
  };
}
