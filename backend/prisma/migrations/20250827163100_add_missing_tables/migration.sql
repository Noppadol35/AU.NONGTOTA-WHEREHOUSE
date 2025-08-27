/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `JobOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."BillStatus" AS ENUM ('PENDING', 'ISSUED', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'PROMPTPAY', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'FAILED', 'REFUNDED');

-- DropIndex
DROP INDEX "public"."JobOrder_licensePlate_key";

-- AlterTable
ALTER TABLE "public"."JobOrder" ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "oldValues" JSONB,
    "newValues" JSONB,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "branchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bill" (
    "id" SERIAL NOT NULL,
    "billNumber" TEXT NOT NULL,
    "jobOrderId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "status" "public"."BillStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatAmount" DOUBLE PRECISION NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "paymentAmount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BillItem" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "carType" TEXT,
    "licensePlate" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "public"."AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "public"."AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_branchId_idx" ON "public"."AuditLog"("branchId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "public"."Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_jobOrderId_idx" ON "public"."Bill"("jobOrderId");

-- CreateIndex
CREATE INDEX "Bill_customerId_idx" ON "public"."Bill"("customerId");

-- CreateIndex
CREATE INDEX "Bill_branchId_idx" ON "public"."Bill"("branchId");

-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "public"."Bill"("status");

-- CreateIndex
CREATE INDEX "Bill_paymentStatus_idx" ON "public"."Bill"("paymentStatus");

-- CreateIndex
CREATE INDEX "Bill_createdAt_idx" ON "public"."Bill"("createdAt");

-- CreateIndex
CREATE INDEX "Bill_billNumber_idx" ON "public"."Bill"("billNumber");

-- CreateIndex
CREATE INDEX "BillItem_billId_idx" ON "public"."BillItem"("billId");

-- CreateIndex
CREATE INDEX "BillItem_productId_idx" ON "public"."BillItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phoneNumber_key" ON "public"."Customer"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_licensePlate_key" ON "public"."Customer"("licensePlate");

-- CreateIndex
CREATE INDEX "Customer_phoneNumber_idx" ON "public"."Customer"("phoneNumber");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "public"."Customer"("name");

-- CreateIndex
CREATE INDEX "Payment_billId_idx" ON "public"."Payment"("billId");

-- CreateIndex
CREATE INDEX "Payment_method_idx" ON "public"."Payment"("method");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "public"."Payment"("createdAt");

-- CreateIndex
CREATE INDEX "JobOrder_customerId_idx" ON "public"."JobOrder"("customerId");

-- CreateIndex
CREATE INDEX "JobOrder_licensePlate_idx" ON "public"."JobOrder"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "public"."Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "public"."Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_isDeleted_idx" ON "public"."Product"("isDeleted");

-- AddForeignKey
ALTER TABLE "public"."JobOrder" ADD CONSTRAINT "JobOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_jobOrderId_fkey" FOREIGN KEY ("jobOrderId") REFERENCES "public"."JobOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "public"."Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillItem" ADD CONSTRAINT "BillItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "public"."Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
