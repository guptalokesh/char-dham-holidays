import type { Metadata } from "next";
import { listPlaces } from "@/lib/place";
import { PlacesPageContent } from "@/components/place/PlacesPageContent";

// Admin-editable content must always reflect the latest database state.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Devrana Mandir & Base Camp | Char Dham Holidays",
  description:
    "Rudreshwar Mahadev Mandir and the Devrana mela, plus our Dhari–Kalogi base camp for Devrana and Rupnyol Bugyal treks.",
  alternates: { canonical: "/devrana-mandir" },
};

export default async function DevranaMandirPage() {
  const places = await listPlaces();
  return <PlacesPageContent places={places} />;
}
