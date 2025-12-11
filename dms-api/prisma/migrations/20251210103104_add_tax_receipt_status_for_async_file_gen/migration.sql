/*
  Warnings:

  - You are about to drop the column `isCanceled` on the `TaxReceipt` table. All the data in the column will be lost.
  - Made the column `storageKey` on table `FileMetadata` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TaxReceiptStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED', 'FAILED');

-- DropForeignKey
ALTER TABLE "TaxReceipt" DROP CONSTRAINT "TaxReceipt_fileId_fkey";

-- AlterTable
ALTER TABLE "FileMetadata" ALTER COLUMN "storageKey" SET NOT NULL;

-- AlterTable
CREATE SEQUENCE taxreceipt_receiptnumber_seq;
ALTER TABLE "TaxReceipt" DROP COLUMN "isCanceled",
ADD COLUMN     "status" "TaxReceiptStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "receiptNumber" SET DEFAULT nextval('taxreceipt_receiptnumber_seq'),
ALTER COLUMN "fileId" DROP NOT NULL;
ALTER SEQUENCE taxreceipt_receiptnumber_seq OWNED BY "TaxReceipt"."receiptNumber";

-- AddForeignKey
ALTER TABLE "TaxReceipt" ADD CONSTRAINT "TaxReceipt_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
