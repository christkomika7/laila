/*
  Warnings:

  - You are about to drop the column `billingCountry` on the `donation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `webhook_event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_userId_fkey";

-- DropIndex
DROP INDEX "donation_userId_idx";

-- DropIndex
DROP INDEX "payment_userId_idx";

-- AlterTable
ALTER TABLE "donation" DROP COLUMN "billingCountry",
ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "webhook_event" DROP COLUMN "payload";

-- CreateIndex
CREATE INDEX "donation_customerId_idx" ON "donation"("customerId");

-- AddForeignKey
ALTER TABLE "donation" ADD CONSTRAINT "donation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
