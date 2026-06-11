-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0;
