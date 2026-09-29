-- CreateEnum
CREATE TYPE "MediaPurpose" AS ENUM ('IMAGE', 'PDF');

-- CreateEnum
CREATE TYPE "RoomAvailabilityStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "EnquiryService" AS ENUM ('GENERAL', 'CHARDHAM', 'TREKKING', 'FARM_HOME_STAY');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteSettings" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT 'Char Dham Holidays',
    "shortDescription" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "mapLink" TEXT,
    "primaryPhone" TEXT,
    "secondaryPhone" TEXT,
    "whatsappNumber" TEXT,
    "primaryEmail" TEXT,
    "enquiryEmail" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "otherSocialUrl" TEXT,
    "logoMediaId" TEXT,
    "faviconMediaId" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1B4B66',
    "secondaryColor" TEXT NOT NULL DEFAULT '#E08A2C',
    "trekkingAccentColor" TEXT NOT NULL DEFAULT '#2F6B3A',
    "heroHeading" TEXT DEFAULT 'Explore Uttarakhand',
    "heroDescription" TEXT DEFAULT 'Spiritual journeys, mountain treks and peaceful stays.',
    "chardhamCtaLabel" TEXT DEFAULT 'Explore Chardham',
    "trekkingCtaLabel" TEXT DEFAULT 'Explore Treks',
    "whatsappCtaText" TEXT DEFAULT 'Chat on WhatsApp',
    "contactCtaText" TEXT DEFAULT 'Send an Enquiry',
    "footerCopyrightText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "purpose" "MediaPurpose" NOT NULL,
    "chardhamPackageId" TEXT,
    "trekId" TEXT,
    "farmPropertyId" TEXT,
    "roomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChardhamPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Chardham Yatra by Helicopter',
    "price" INTEGER NOT NULL,
    "destinations" TEXT[],
    "stayInfo" TEXT NOT NULL,
    "foodInfo" TEXT NOT NULL,
    "travelInfo" TEXT NOT NULL,
    "travelPeriod" TEXT,
    "routeOverview" TEXT,
    "importantInfo" TEXT,
    "itineraryMediaId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChardhamPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trek" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER,
    "itineraryMediaId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmProperty" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "mapLink" TEXT,
    "amenities" JSONB,
    "guestCapacityNote" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "farmPropertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "amenities" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomAvailability" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "RoomAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "service" "EnquiryService" NOT NULL,
    "message" TEXT,
    "details" JSONB,
    "trekId" TEXT,
    "roomId" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteSettings_logoMediaId_key" ON "WebsiteSettings"("logoMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteSettings_faviconMediaId_key" ON "WebsiteSettings"("faviconMediaId");

-- CreateIndex
CREATE INDEX "Media_chardhamPackageId_idx" ON "Media"("chardhamPackageId");

-- CreateIndex
CREATE INDEX "Media_trekId_idx" ON "Media"("trekId");

-- CreateIndex
CREATE INDEX "Media_farmPropertyId_idx" ON "Media"("farmPropertyId");

-- CreateIndex
CREATE INDEX "Media_roomId_idx" ON "Media"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Trek_slug_key" ON "Trek"("slug");

-- CreateIndex
CREATE INDEX "Room_farmPropertyId_idx" ON "Room"("farmPropertyId");

-- CreateIndex
CREATE INDEX "RoomAvailability_roomId_date_idx" ON "RoomAvailability"("roomId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoomAvailability_roomId_date_key" ON "RoomAvailability"("roomId", "date");

-- CreateIndex
CREATE INDEX "Enquiry_status_idx" ON "Enquiry"("status");

-- CreateIndex
CREATE INDEX "Enquiry_service_idx" ON "Enquiry"("service");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "WebsiteSettings" ADD CONSTRAINT "WebsiteSettings_logoMediaId_fkey" FOREIGN KEY ("logoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteSettings" ADD CONSTRAINT "WebsiteSettings_faviconMediaId_fkey" FOREIGN KEY ("faviconMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_chardhamPackageId_fkey" FOREIGN KEY ("chardhamPackageId") REFERENCES "ChardhamPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_trekId_fkey" FOREIGN KEY ("trekId") REFERENCES "Trek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_farmPropertyId_fkey" FOREIGN KEY ("farmPropertyId") REFERENCES "FarmProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_farmPropertyId_fkey" FOREIGN KEY ("farmPropertyId") REFERENCES "FarmProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAvailability" ADD CONSTRAINT "RoomAvailability_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_trekId_fkey" FOREIGN KEY ("trekId") REFERENCES "Trek"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
