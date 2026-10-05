-- AlterTable: new defaults for a Char Dham led home page
ALTER TABLE "WebsiteSettings" ALTER COLUMN "heroHeading" SET DEFAULT 'Visit the Char Dham by Helicopter',
ALTER COLUMN "heroDescription" SET DEFAULT 'Fly to Yamunotri, Gangotri, Kedarnath and Badrinath, and spend your time on darshan, not on the road.',
ALTER COLUMN "chardhamCtaLabel" SET DEFAULT 'Explore Char Dham';

-- Update existing rows only if they still hold the old defaults (never overwrite admin edits)
UPDATE "WebsiteSettings" SET "heroHeading" = 'Visit the Char Dham by Helicopter' WHERE "heroHeading" = 'Explore Uttarakhand';
UPDATE "WebsiteSettings" SET "heroDescription" = 'Fly to Yamunotri, Gangotri, Kedarnath and Badrinath, and spend your time on darshan, not on the road.'
  WHERE "heroDescription" = 'Spiritual journeys, mountain treks and peaceful stays.';
UPDATE "WebsiteSettings" SET "chardhamCtaLabel" = 'Explore Char Dham' WHERE "chardhamCtaLabel" = 'Explore Chardham';
