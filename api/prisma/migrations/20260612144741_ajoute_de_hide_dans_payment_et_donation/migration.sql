-- AlterTable
ALTER TABLE "donation" ADD COLUMN     "hide" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "hide" BOOLEAN NOT NULL DEFAULT false;
