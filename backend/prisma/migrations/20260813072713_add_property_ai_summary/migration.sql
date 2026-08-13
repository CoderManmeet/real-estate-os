-- CreateTable
CREATE TABLE "property_ai_summaries" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "pros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "investmentScore" INTEGER,
    "investmentNote" TEXT,
    "model" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_ai_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_ai_summaries_propertyId_key" ON "property_ai_summaries"("propertyId");

-- AddForeignKey
ALTER TABLE "property_ai_summaries" ADD CONSTRAINT "property_ai_summaries_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
