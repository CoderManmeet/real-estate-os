-- CreateEnum
CREATE TYPE "InventoryUpdateSource" AS ENUM ('AGENT', 'BUILDER');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "inventory_status_logs" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "previousStatus" "PropertyStatus" NOT NULL,
    "newStatus" "PropertyStatus" NOT NULL,
    "source" "InventoryUpdateSource" NOT NULL DEFAULT 'AGENT',
    "note" TEXT,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_status_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_status_logs" ADD CONSTRAINT "inventory_status_logs_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_status_logs" ADD CONSTRAINT "inventory_status_logs_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
