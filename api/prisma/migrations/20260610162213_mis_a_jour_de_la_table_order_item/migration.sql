/*
  Warnings:

  - Added the required column `title` to the `order_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_variantId_fkey";

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "albumId" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "trackId" TEXT,
ALTER COLUMN "variantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
