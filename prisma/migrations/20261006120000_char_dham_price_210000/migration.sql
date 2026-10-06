-- Char Dham price is now 2,10,000 per person. Only changes the value set by the
-- previous release, so a price edited in admin is left alone.
UPDATE "ChardhamPackage" SET "price" = 210000
  WHERE "slug" = 'char-dham' AND "price" = 21000;
