-- CreateIndex
CREATE UNIQUE INDEX "ChardhamPackage_itineraryMediaId_key" ON "ChardhamPackage"("itineraryMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Trek_itineraryMediaId_key" ON "Trek"("itineraryMediaId");

-- AddForeignKey
ALTER TABLE "ChardhamPackage" ADD CONSTRAINT "ChardhamPackage_itineraryMediaId_fkey" FOREIGN KEY ("itineraryMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trek" ADD CONSTRAINT "Trek_itineraryMediaId_fkey" FOREIGN KEY ("itineraryMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

