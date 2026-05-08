-- Create Client table
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT,
    "identification" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE UNIQUE INDEX "Client_identification_key" ON "Client"("identification");
CREATE INDEX "Client_name_idx" ON "Client"("name");
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- Add client relations to existing tables
ALTER TABLE "Invoice" ADD COLUMN "clientId" TEXT;
ALTER TABLE "AdminQuote" ADD COLUMN "clientId" TEXT;
ALTER TABLE "QuoteRequest" ADD COLUMN "clientId" TEXT;

CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");
CREATE INDEX "AdminQuote_clientId_idx" ON "AdminQuote"("clientId");
CREATE INDEX "QuoteRequest_clientId_idx" ON "QuoteRequest"("clientId");

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdminQuote"
ADD CONSTRAINT "AdminQuote_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "QuoteRequest"
ADD CONSTRAINT "QuoteRequest_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
