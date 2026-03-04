/*
  Warnings:

  - The values [CREATE,UPDATE] on the enum `DonorEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DonorEventType_new" AS ENUM ('UPSERT', 'DELETE', 'MERGE');
ALTER TABLE "DonorSyncEvent" ALTER COLUMN "eventType" TYPE "DonorEventType_new" USING ("eventType"::text::"DonorEventType_new");
ALTER TYPE "DonorEventType" RENAME TO "DonorEventType_old";
ALTER TYPE "DonorEventType_new" RENAME TO "DonorEventType";
DROP TYPE "public"."DonorEventType_old";
COMMIT;
