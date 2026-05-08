-- Add invoice auto-generation linkage and payment method
ALTER TABLE "Invoice"
ADD COLUMN "sourceQuoteId" TEXT,
ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'transferencia';

CREATE UNIQUE INDEX "Invoice_sourceQuoteId_key" ON "Invoice"("sourceQuoteId");

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_sourceQuoteId_fkey"
FOREIGN KEY ("sourceQuoteId") REFERENCES "AdminQuote"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
