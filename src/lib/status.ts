// Máquinas de estado de pedidos e solicitações personalizadas.

export const ORDER_STATUSES = [
  "pendente",
  "pago",
  "em_producao",
  "enviado",
  "entregue",
  "cancelado",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pendente: ["pago", "cancelado"],
  pago: ["em_producao", "cancelado"],
  em_producao: ["enviado", "cancelado"],
  enviado: ["entregue"],
  entregue: [],
  cancelado: [],
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  em_producao: "Em produção",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function isOrderStatus(v: string): v is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(v);
}

export function nextOrderStatuses(from: string): readonly OrderStatus[] {
  return isOrderStatus(from) ? ORDER_TRANSITIONS[from] : [];
}

export function canTransitionOrder(from: string, to: string): boolean {
  return isOrderStatus(to) && nextOrderStatuses(from).includes(to);
}

export const CUSTOM_STATUSES = ["nova", "orcada", "aprovada", "recusada"] as const;
export type CustomStatus = (typeof CUSTOM_STATUSES)[number];

const CUSTOM_TRANSITIONS: Record<CustomStatus, readonly CustomStatus[]> = {
  nova: ["orcada"],
  orcada: ["aprovada", "recusada"],
  aprovada: [],
  recusada: [],
};

export const CUSTOM_STATUS_LABEL: Record<CustomStatus, string> = {
  nova: "Nova",
  orcada: "Orçada",
  aprovada: "Aprovada",
  recusada: "Recusada",
};

export function isCustomStatus(v: string): v is CustomStatus {
  return (CUSTOM_STATUSES as readonly string[]).includes(v);
}

export function nextCustomStatuses(from: string): readonly CustomStatus[] {
  return isCustomStatus(from) ? CUSTOM_TRANSITIONS[from] : [];
}

/** "orcada" exige um preço orçado registrado. */
export function canTransitionCustom(from: string, to: string, quotedPriceCents: number | null): boolean {
  if (!isCustomStatus(to) || !nextCustomStatuses(from).includes(to)) return false;
  if (to === "orcada" && (quotedPriceCents === null || quotedPriceCents <= 0)) return false;
  return true;
}
