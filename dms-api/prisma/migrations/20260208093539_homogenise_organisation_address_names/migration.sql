/*
  Warnings:

  - You are about to drop the column `address` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `locality` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `postCode` on the `Organisation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "address",
DROP COLUMN "locality",
DROP COLUMN "postCode",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "streetAddress" TEXT;
