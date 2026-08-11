-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "property_nearby_places" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "placeType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_nearby_places_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "property_nearby_places" ADD CONSTRAINT "property_nearby_places_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
