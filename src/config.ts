// Configurações da loja. Valores monetários em centavos.

export const STORE_NAME = "Yumi Mix";

// Frete: valores editáveis no admin (/admin/frete), tabela StoreSettings.

/** Prazo (dias úteis) para peças marcadas como pronta entrega. */
export const READY_TO_SHIP_DAYS = 1;

/** Limite de unidades por item do carrinho. */
export const MAX_QUANTITY_PER_ITEM = 20;

/** Pedido personalizado: limites de upload. */
export const CUSTOM_MAX_IMAGES = 4;
export const CUSTOM_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Admin de produtos: limites de upload. */
export const PRODUCT_MAX_IMAGES = 12;
export const PRODUCT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const PRODUCT_MAX_VIDEO_BYTES = 60 * 1024 * 1024;
export const PRINT_FILE_MAX_BYTES = 200 * 1024 * 1024;

/** Validade do link assinado que o Bambu Studio usa para baixar o .3mf. */
export const PRINT_LINK_HOURS = 6;

/** Numeração inicial visível dos pedidos (#1001…). */
export const FIRST_ORDER_NUMBER = 1001;
export const FIRST_CUSTOM_REQUEST_NUMBER = 1;

/** Links de rede social no rodapé. Placeholder até a loja ter perfis de verdade. */
/** Lojas da Yumi Mix nos marketplaces (rodapé). */
export const STORE_LINKS = {
  shopee: "https://shopee.com.br/shop/1795481518",
  mercadoLivre: "https://lista.mercadolivre.com.br/_CustId_3264697547",
};
