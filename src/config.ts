// Configurações da loja. Valores monetários em centavos.

export const STORE_NAME = "Yumi Mix";

/** Valor fixo da opção "Entrega". */
export const SHIPPING_FEE_CENTS = 2000; // R$ 20,00

/** Pedidos com subtotal a partir deste valor têm entrega grátis. `null` desliga. */
export const FREE_SHIPPING_THRESHOLD_CENTS: number | null = 20000; // R$ 200,00

/** Prazo (dias úteis) para peças marcadas como pronta entrega. */
export const READY_TO_SHIP_DAYS = 1;

/** Limite de unidades por item do carrinho. */
export const MAX_QUANTITY_PER_ITEM = 20;

/** Texto exibido para a retirada local. */
export const PICKUP_NOTE = "Combinamos dia e horário pelo WhatsApp depois do pagamento.";

/** Pedido personalizado: limites de upload. */
export const CUSTOM_MAX_IMAGES = 4;
export const CUSTOM_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Numeração inicial visível dos pedidos (#1001…). */
export const FIRST_ORDER_NUMBER = 1001;
export const FIRST_CUSTOM_REQUEST_NUMBER = 1;

/** Links de rede social no rodapé. Placeholder até a loja ter perfis de verdade. */
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/yumimix",
  whatsapp: "https://wa.me/5500000000000",
};
