-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('DRAFT', 'ACTIVE');

-- CreateTable
CREATE TABLE "FileMetadata" (
    "id" UUID NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "storageKey" TEXT,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "FileMetadata_pkey" PRIMARY KEY ("id")
);
