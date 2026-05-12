ALTER TABLE "InvoiceItem"
ADD COLUMN "profitPercentage" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "total" DOUBLE PRECISION;

UPDATE "InvoiceItem"
SET "total" = "precio" * "cantidad"
WHERE "total" IS NULL;
