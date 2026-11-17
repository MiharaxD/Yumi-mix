// Contrato de pagamento. A loja só conversa com esta interface;
// trocar o FakeProvider por um provedor real (ex.: Mercado Pago) é
// implementar estes métodos e mudar a linha em ./index.ts.

export type PaymentMethod = "pix" | "cartao";

export type OrderForPayment = {
  id: string;
  number: number;
  totalCents: number;
  customerName: string;
  email: string;
};

export type PixCharge = {
  method: "pix";
  /** Código "copia e cola". */
  copyPaste: string;
  /** Imagem do QR code (data URI ou URL do provedor). */
  qrImageSrc: string;
  expiresAt: Date;
};

export type CardCheckout = {
  method: "cartao";
  /** URL do checkout hospedado pelo provedor. A loja nunca coleta dados de cartão. */
  checkoutUrl: string | null;
};

/** Evento normalizado vindo do webhook do provedor. */
export type PaymentEvent = {
  orderId: string;
  outcome: "approved" | "rejected";
  providerPaymentId: string;
  reason?: string;
};

export interface PaymentProvider {
  readonly id: string;
  /** true quando nenhum dinheiro real circula (habilita os botões de simulação). */
  readonly isSimulated: boolean;
  createPixCharge(order: OrderForPayment): Promise<PixCharge>;
  createCardCheckout(order: OrderForPayment): Promise<CardCheckout>;
  /**
   * Lê e valida a requisição do webhook (assinatura, formato) e devolve o
   * evento normalizado, ou null se a requisição não for válida.
   */
  parseWebhook(request: Request): Promise<PaymentEvent | null>;
}
