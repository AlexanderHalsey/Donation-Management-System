-- CreateEnum
CREATE TYPE "TaxReceiptType" AS ENUM ('INDIVIDUAL', 'ANNUAL');

-- CreateTable
CREATE TABLE "TaxReceipt" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receiptNumber" INTEGER NOT NULL,
    "fileId" UUID NOT NULL,
    "donorId" UUID NOT NULL,
    "isCanceled" BOOLEAN NOT NULL DEFAULT false,
    "canceledReason" TEXT,
    "canceledAt" TIMESTAMP(3),
    "type" "TaxReceiptType" NOT NULL,

    CONSTRAINT "TaxReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxReceipt_fileId_key" ON "TaxReceipt"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxReceipt_receiptNumber_key" ON "TaxReceipt"("receiptNumber");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_taxReceiptId_fkey" FOREIGN KEY ("taxReceiptId") REFERENCES "TaxReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReceipt" ADD CONSTRAINT "TaxReceipt_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReceipt" ADD CONSTRAINT "TaxReceipt_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
