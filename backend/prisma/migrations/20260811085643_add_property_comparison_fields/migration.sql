-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "annualAppreciationPercent" DOUBLE PRECISION,
ADD COLUMN     "estimatedRentalMonthly" DOUBLE PRECISION,
ADD COLUMN     "maintenanceMonthly" DOUBLE PRECISION,
ADD COLUMN     "possessionDate" TIMESTAMP(3);
