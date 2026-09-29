import type { Metadata } from "next";
import { getFarmProperty } from "@/lib/farm";
import { FarmPageContent } from "@/components/farm/FarmPageContent";

// Admin-editable content and live room availability must never be frozen
// at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Farm Home Stay | Char Dham Holidays",
  description:
    "A peaceful, nature-focused farm home stay in Uttarakhand. Check room availability for your dates and request a booking.",
  alternates: { canonical: "/farm-home-stay" },
};

export default async function FarmHomeStayPage() {
  const property = await getFarmProperty();

  return <FarmPageContent property={property} />;
}
