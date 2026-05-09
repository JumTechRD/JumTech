-- Add public quote detail fields to AdminQuote
ALTER TABLE "AdminQuote"
ADD COLUMN "tipoServicio" TEXT,
ADD COLUMN "urgencia" TEXT,
ADD COLUMN "descripcionProyecto" TEXT,
ADD COLUMN "ubicacionProyecto" TEXT;
