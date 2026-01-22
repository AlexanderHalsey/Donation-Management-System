/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Donor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DonorSyncEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DonorEventType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'MERGE');

-- CreateTable
CREATE TABLE "DonorSyncEvent" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "eventType" "DonorEventType" NOT NULL,
    "externalId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "DonorSyncEventStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DonorSyncEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonorSyncEvent_requestId_eventType_externalId_key" ON "DonorSyncEvent"("requestId", "eventType", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_externalId_key" ON "Donor"("externalId");
