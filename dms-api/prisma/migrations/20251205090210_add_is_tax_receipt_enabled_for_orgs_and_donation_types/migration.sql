-- AlterTable
ALTER TABLE "DonationType" ADD COLUMN     "isTaxReceiptEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "isTaxReceiptEnabled" BOOLEAN NOT NULL DEFAULT false;
