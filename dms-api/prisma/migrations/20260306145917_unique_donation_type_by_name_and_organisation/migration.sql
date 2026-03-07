/*
  Warnings:

  - A unique constraint covering the columns `[name,organisationId]` on the table `DonationType` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DonationType_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "DonationType_name_organisationId_key" ON "DonationType"("name", "organisationId");
