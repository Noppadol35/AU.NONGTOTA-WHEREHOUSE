-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."PurchaseOrder" ADD COLUMN     "jobOrderId" INTEGER;

-- AlterTable
ALTER TABLE "public"."StockTransaction" ADD COLUMN     "jobOrderId" INTEGER;

-- CreateTable
CREATE TABLE "public"."JobOrder" (
    "id" SERIAL NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "carType" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "issueDetail" TEXT NOT NULL,
    "jobDetail" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'OPEN',
    "branchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobOrderItem" (
    "id" SERIAL NOT NULL,
    "jobOrderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobOrder_jobNumber_key" ON "public"."JobOrder"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JobOrder_licensePlate_key" ON "public"."JobOrder"("licensePlate");

-- CreateIndex
CREATE INDEX "JobOrder_branchId_idx" ON "public"."JobOrder"("branchId");

-- AddForeignKey
ALTER TABLE "public"."StockTransaction" ADD CONSTRAINT "StockTransaction_jobOrderId_fkey" FOREIGN KEY ("jobOrderId") REFERENCES "public"."JobOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_jobOrderId_fkey" FOREIGN KEY ("jobOrderId") REFERENCES "public"."JobOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobOrder" ADD CONSTRAINT "JobOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobOrderItem" ADD CONSTRAINT "JobOrderItem_jobOrderId_fkey" FOREIGN KEY ("jobOrderId") REFERENCES "public"."JobOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobOrderItem" ADD CONSTRAINT "JobOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
