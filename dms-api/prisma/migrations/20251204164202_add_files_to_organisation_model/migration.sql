/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `signatureUrl` on the `Organisation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[logoId]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[signatureId]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "logoUrl",
DROP COLUMN "signatureUrl",
ADD COLUMN     "logoId" UUID,
ADD COLUMN     "signatureId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_logoId_key" ON "Organisation"("logoId");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_signatureId_key" ON "Organisation"("signatureId");

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "FileMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "FileMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
