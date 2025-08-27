/*
  Warnings:

  - Added the required column `branchId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- First, add columns with default values
ALTER TABLE "public"."User" ADD COLUMN     "branchId" INTEGER DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Update existing users to have branchId = 1 (Main Branch)
UPDATE "public"."User" SET "branchId" = 1 WHERE "branchId" IS NULL;

-- Update existing users to have updatedAt = createdAt
UPDATE "public"."User" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Make columns NOT NULL after setting values
ALTER TABLE "public"."User" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Remove default values
ALTER TABLE "public"."User" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "public"."Session"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
