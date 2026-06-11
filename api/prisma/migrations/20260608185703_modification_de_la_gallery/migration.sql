-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE';
