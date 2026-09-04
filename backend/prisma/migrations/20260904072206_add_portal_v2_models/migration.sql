-- CreateEnum
CREATE TYPE "FeedbackSentiment" AS ENUM ('INTERESTED', 'MAYBE', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "ClientActivityType" AS ENUM ('PORTAL_OPENED', 'PROPERTY_VIEWED', 'PROPERTY_FAVORITED', 'PROPERTY_UNFAVORITED', 'FEEDBACK_GIVEN', 'COMMENT_ADDED', 'SITE_VISIT_REQUESTED', 'SITE_VISIT_CONFIRMED', 'CONTACT_AGENT', 'CALL_AGENT', 'WHATSAPP_AGENT');

-- CreateEnum
CREATE TYPE "RequirementFurnishing" AS ENUM ('UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED');

-- CreateEnum
CREATE TYPE "RequirementPurpose" AS ENUM ('BUY', 'RENT', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "RequirementUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
ALTER TYPE "SiteVisitStatus" ADD VALUE 'REQUESTED';

-- AlterTable
ALTER TABLE "client_requirements" ADD COLUMN     "facing" TEXT,
ADD COLUMN     "financing" TEXT,
ADD COLUMN     "floorPreference" TEXT,
ADD COLUMN     "furnishing" "RequirementFurnishing",
ADD COLUMN     "maxArea" DOUBLE PRECISION,
ADD COLUMN     "minArea" DOUBLE PRECISION,
ADD COLUMN     "parking" BOOLEAN,
ADD COLUMN     "possessionBy" TIMESTAMP(3),
ADD COLUMN     "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "purpose" "RequirementPurpose",
ADD COLUMN     "urgency" "RequirementUrgency";

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "portalTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "portalTokenRevokedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "shared_properties" ADD COLUMN     "collectionId" TEXT,
ADD COLUMN     "position" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "property_collections" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_feedback" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "collectionId" TEXT,
    "sentiment" "FeedbackSentiment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_comments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT,
    "collectionId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_activities" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "collectionId" TEXT,
    "propertyId" TEXT,
    "type" "ClientActivityType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_collections_accessToken_key" ON "property_collections"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "property_feedback_clientId_propertyId_key" ON "property_feedback"("clientId", "propertyId");

-- CreateIndex
CREATE INDEX "client_activities_clientId_createdAt_idx" ON "client_activities"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "shared_properties" ADD CONSTRAINT "shared_properties_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "property_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_collections" ADD CONSTRAINT "property_collections_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_collections" ADD CONSTRAINT "property_collections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_feedback" ADD CONSTRAINT "property_feedback_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_feedback" ADD CONSTRAINT "property_feedback_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_feedback" ADD CONSTRAINT "property_feedback_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "property_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_comments" ADD CONSTRAINT "property_comments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_comments" ADD CONSTRAINT "property_comments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_comments" ADD CONSTRAINT "property_comments_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "property_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "property_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
