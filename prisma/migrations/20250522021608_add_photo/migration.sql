/*
  Warnings:

  - You are about to drop the column `galleryImages` on the `Response` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Response" DROP COLUMN "galleryImages",
ADD COLUMN     "photo" TEXT;
