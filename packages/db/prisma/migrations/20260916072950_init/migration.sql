-- CreateEnum
CREATE TYPE "CostComponent" AS ENUM ('FLIGHT', 'ACCOMMODATION', 'PACKAGE_TOUR', 'TRANSFER', 'INSURANCE', 'FOOD', 'EXCURSIONS', 'VISA');

-- CreateEnum
CREATE TYPE "ComfortTier" AS ENUM ('ECONOMY', 'STANDARD', 'COMFORT');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('TRAVELPAYOUTS', 'LEVEL_TRAVEL', 'TRAVELATA', 'CHEREHAPA', 'KIWITAXI', 'MANUAL');

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "visaRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_points" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "component" "CostComponent" NOT NULL,
    "month" INTEGER NOT NULL,
    "tier" "ComfortTier" NOT NULL,
    "originCity" TEXT,
    "valueMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "source" "PriceSource" NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "price_points_destinationId_component_month_tier_idx" ON "price_points"("destinationId", "component", "month", "tier");

-- CreateIndex
CREATE INDEX "price_points_collectedAt_idx" ON "price_points"("collectedAt");

-- AddForeignKey
ALTER TABLE "price_points" ADD CONSTRAINT "price_points_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
