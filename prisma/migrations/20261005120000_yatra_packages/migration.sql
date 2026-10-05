-- AlterTable: add columns (slug is added nullable first so existing rows can be backfilled)
ALTER TABLE "ChardhamPackage" ADD COLUMN     "dhamChoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "howItStarts" TEXT,
ADD COLUMN     "inclusions" TEXT[],
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "startPoint" TEXT,
ADD COLUMN     "steps" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "tagline" TEXT,
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "stayInfo" SET DEFAULT '',
ALTER COLUMN "foodInfo" SET DEFAULT '',
ALTER COLUMN "travelInfo" SET DEFAULT '';

-- Backfill: the existing singleton becomes the Char Dham package
UPDATE "ChardhamPackage" SET "slug" = 'char-dham', "order" = 1
  WHERE "id" = 'singleton-chardham-package';
UPDATE "ChardhamPackage" SET "slug" = 'package-' || "id" WHERE "slug" IS NULL;

-- Guarded content updates: only touch values the admin has not already changed
UPDATE "ChardhamPackage" SET "price" = 21000
  WHERE "id" = 'singleton-chardham-package' AND "price" = 210000;
UPDATE "ChardhamPackage" SET "name" = 'Char Dham Yatra by Helicopter'
  WHERE "id" = 'singleton-chardham-package' AND "name" = 'Chardham Yatra by Helicopter';
UPDATE "ChardhamPackage" SET "destinations" = array_replace("destinations", 'Sri Kedarnath', 'Kedarnath')
  WHERE "id" = 'singleton-chardham-package';

ALTER TABLE "ChardhamPackage" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "chardhamPackageId" TEXT;

-- Existing Char Dham enquiries belong to the Char Dham package
UPDATE "Enquiry" SET "chardhamPackageId" = 'singleton-chardham-package'
  WHERE "service" = 'CHARDHAM'
    AND EXISTS (SELECT 1 FROM "ChardhamPackage" WHERE "id" = 'singleton-chardham-package');

-- CreateIndex
CREATE UNIQUE INDEX "ChardhamPackage_slug_key" ON "ChardhamPackage"("slug");

-- CreateIndex
CREATE INDEX "Enquiry_chardhamPackageId_idx" ON "Enquiry"("chardhamPackageId");

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_chardhamPackageId_fkey" FOREIGN KEY ("chardhamPackageId") REFERENCES "ChardhamPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
