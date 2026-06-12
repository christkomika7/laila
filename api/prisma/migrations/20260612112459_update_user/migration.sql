-- AlterTable
ALTER TABLE "donation" ADD COLUMN     "billingCountry" TEXT,
ADD COLUMN     "correspondent" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "msisdn" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "webhook_event" ADD COLUMN     "payload" JSONB;

-- CreateIndex
CREATE INDEX "donation_userId_idx" ON "donation"("userId");

-- CreateIndex
CREATE INDEX "payment_userId_idx" ON "payment"("userId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation" ADD CONSTRAINT "donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
