/*
  Warnings:

  - Added the required column `userId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('RESOLVED', 'UNRESOLVED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('PENDING', 'ANSWERED', 'CLOSED');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "feedbackStatus" "FeedbackStatus" NOT NULL DEFAULT 'UNRESOLVED',
ADD COLUMN     "responseStatus" "ResponseStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
