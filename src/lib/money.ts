const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata centavos como "R$ 89,90". */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

/** Converte "89,90" / "89.90" / "R$ 1.089,90" em centavos. Retorna null se inválido. */
export function parseBRLToCents(input: string): number | null {
  const cleaned = input.replace(/[R$\s]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}
