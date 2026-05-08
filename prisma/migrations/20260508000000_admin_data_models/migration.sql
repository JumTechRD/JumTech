-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "imagen" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4,
    "especificaciones" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "precioCompra" DOUBLE PRECISION,
    "margenGanancia" DOUBLE PRECISION,
    "proveedor" TEXT,
    "codigoBarras" TEXT,
    "sku" TEXT,
    "peso" DOUBLE PRECISION,
    "dimensiones" JSONB,
    "garantia" INTEGER,
    "ubicacion" TEXT,
    "stockMinimo" INTEGER,
    "stockMaximo" INTEGER,
    "vendido" INTEGER NOT NULL DEFAULT 0,
    "ultimaVenta" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "vencimiento" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "impuestos" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "imagen" TEXT,
    "cantidad" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminQuote" (
    "id" TEXT NOT NULL,
    "numeroFactura" TEXT,
    "cliente" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "impuestos" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "monedaPrincipal" TEXT,
    "itbisActivo" BOOLEAN NOT NULL DEFAULT true,
    "porcentajeItbis" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminQuoteItem" (
    "id" TEXT NOT NULL,
    "adminQuoteId" TEXT NOT NULL,
    "productId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "esManual" BOOLEAN NOT NULL DEFAULT false,
    "moneda" TEXT,
    "porcentajeExtra" DOUBLE PRECISION,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdminQuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_categoria_idx" ON "Product"("categoria");

-- CreateIndex
CREATE INDEX "Product_activo_idx" ON "Product"("activo");

-- CreateIndex
CREATE INDEX "Product_fechaCreacion_idx" ON "Product"("fechaCreacion");

-- CreateIndex
CREATE INDEX "Invoice_estado_idx" ON "Invoice"("estado");

-- CreateIndex
CREATE INDEX "Invoice_fecha_idx" ON "Invoice"("fecha");

-- CreateIndex
CREATE INDEX "Invoice_email_idx" ON "Invoice"("email");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_productId_idx" ON "InvoiceItem"("productId");

-- CreateIndex
CREATE INDEX "AdminQuote_estado_idx" ON "AdminQuote"("estado");

-- CreateIndex
CREATE INDEX "AdminQuote_fecha_idx" ON "AdminQuote"("fecha");

-- CreateIndex
CREATE INDEX "AdminQuote_email_idx" ON "AdminQuote"("email");

-- CreateIndex
CREATE INDEX "AdminQuoteItem_adminQuoteId_idx" ON "AdminQuoteItem"("adminQuoteId");

-- CreateIndex
CREATE INDEX "AdminQuoteItem_productId_idx" ON "AdminQuoteItem"("productId");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminQuoteItem" ADD CONSTRAINT "AdminQuoteItem_adminQuoteId_fkey" FOREIGN KEY ("adminQuoteId") REFERENCES "AdminQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminQuoteItem" ADD CONSTRAINT "AdminQuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
