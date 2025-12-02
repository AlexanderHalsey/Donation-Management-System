/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `DonationAssetType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `DonationMethod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `DonationType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `PaymentMode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DonationAssetType_name_key" ON "DonationAssetType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DonationMethod_name_key" ON "DonationMethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DonationType_name_key" ON "DonationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_name_key" ON "Organisation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMode_name_key" ON "PaymentMode"("name");
