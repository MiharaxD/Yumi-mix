// Contrato de pagamento. A loja só conversa com esta interface;
// o provedor ativo é escolhido em ./index.ts (Mercado Pago ou simulação).

export type OrderItemForPayment = {
  productName: string;
  variantName: string;
  unitPriceCents: number;
  quantity: number;
};

export type OrderForPayment = {
  id: string;
  number: number;
  totalCents: number;
  shippingCents: number;
  customerName: string;
  email: string;
  items: OrderItemForPayment[];
};

export type PixCharge = {
  method: "pix";
  /** Código "copia e cola". */
  copyPaste: string;
  /** Imagem do QR code (data URI ou URL do provedor). */
  qrImageSrc: string;
  expiresAt: Date;
};

/** Evento normalizado: o que o provedor diz sobre o pagamento de um pedido. */
export type PaymentEvent = {
  orderId: string;
  outcome: "approved" | "rejected";
  providerPaymentId: string;
  /** Valor confirmado pelo provedor, quando ele informa. Conferido contra o pedido. */
  amountCents?: number;
  reason?: string;
};

/** Resultado da leitura de um webhook. */
export type WebhookResult =
  | { kind: "invalid" } // assinatura ou formato inválidos → 401/400
  | { kind: "ignored" } // válido, mas não muda nada (ex.: pagamento ainda pendente)
  | { kind: "event"; event: PaymentEvent };

export interface PaymentProvider {
  readonly id: string;
  /** true quando nenhum dinheiro real circula (habilita os botões de simulação). */
  readonly isSimulated: boolean;
  /**
   * Cria o checkout hospedado pelo provedor e devolve a URL para onde o
   * cliente vai pagar. A loja nunca coleta dados de cartão.
   */
  createCheckout(order: OrderForPayment, baseUrl: string): Promise<{ url: string }>;
  /** Consulta um pagamento no provedor (usado na volta do checkout). */
  getPaymentEvent(paymentId: string): Promise<PaymentEvent | null>;
  /**
   * Procura no provedor um pagamento aprovado do pedido. Rede de segurança para
   * quando o cliente não volta pelo link e o webhook não chega (ex.: localhost).
   */
  findApprovedPayment(orderId: string): Promise<PaymentEvent | null>;
  /** Valida a requisição do webhook (assinatura, formato) e normaliza o evento. */
  parseWebhook(request: Request): Promise<WebhookResult>;
}
