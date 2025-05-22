-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "organizationIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
