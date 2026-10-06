import type { Metadata } from "next";
import { listTreks } from "@/lib/trek";
import { listPlaces } from "@/lib/place";
import { PlacesPageContent } from "@/components/place/PlacesPageContent";
import { TrekCard } from "@/components/trek/TrekCard";

// Listings are admin-editable and must always reflect the latest database
// state rather than being frozen at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trekking in Uttarakhand | Char Dham Holidays",
  description:
    "Customised Himalayan treks including Devrana Trek and Rupnyol Bugyal Trek. Share your group size and preferred dates to get availability and pricing.",
  alternates: { canonical: "/trekking" },
};

export default async function TrekkingPage() {
  const [treks, places] = await Promise.all([listTreks(), listPlaces()]);

  return (
    <main className="bg-gradient-to-b from-emerald-50/60 to-transparent">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Adventure
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">
          Trekking, built around your group.
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Every trek is a customised service — share your group size and preferred
          dates and we&apos;ll confirm availability, pricing and itinerary directly
          with you.
        </p>

      {treks.length === 0 ? (
        <p className="mt-8 text-stone-500">No treks are available right now.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {treks.map((trek, index) => (
            <TrekCard key={trek.id} trek={trek} priority={index === 0} />
          ))}
        </div>
      )}
      </div>
      <PlacesPageContent places={places} />
    </main>
  );
}
