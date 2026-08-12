/*
  Warnings:

  - A unique constraint covering the columns `[portalToken]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "portalToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clients_portalToken_key" ON "clients"("portalToken");
