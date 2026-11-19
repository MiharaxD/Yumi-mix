-- Produtos: arquivamento, frete embutido, pacote e arquivo 3D
ALTER TABLE "Product" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "shippingCreditCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "weightGrams" INTEGER NOT NULL DEFAULT 300;
ALTER TABLE "Product" ADD COLUMN "boxHeightCm" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Product" ADD COLUMN "boxWidthCm" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "Product" ADD COLUMN "boxLengthCm" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "Product" ADD COLUMN "printFilePath" TEXT;
ALTER TABLE "Product" ADD COLUMN "printFileName" TEXT;
ALTER TABLE "Product" ADD COLUMN "printFileBytes" INTEGER;

-- Pedidos: endereço completo, frete cotado e rastreio
ALTER TABLE "Order" ADD COLUMN "complement" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "neighborhood" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ALTER COLUMN "deliveryMethod" SET DEFAULT 'entrega';
ALTER TABLE "Order" ADD COLUMN "shippingRealCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "shippingServiceId" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingServiceName" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingDays" INTEGER;
ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "trackingEmailSentAt" TIMESTAMP(3);

-- Configuração da loja (linha única)
CREATE TABLE "StoreSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "originCep" TEXT NOT NULL DEFAULT '',
    "freeShippingThresholdCents" INTEGER DEFAULT 20000,
    "fallbackShippingCents" INTEGER NOT NULL DEFAULT 2000,
    "fallbackShippingDays" INTEGER NOT NULL DEFAULT 7,
    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
