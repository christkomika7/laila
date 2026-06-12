/*
  Warnings:

  - You are about to drop the column `downloadCount` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `downloadCount` on the `Track` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "downloadCount",
ADD COLUMN     "purchaseCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "downloadCount",
ADD COLUMN     "purchaseCount" INTEGER NOT NULL DEFAULT 0;
