import Image from "next/image";
import { formatInr } from "@/lib/format";
import { ChardhamAvailabilityForm } from "@/components/chardham/ChardhamAvailabilityForm";

export interface ChardhamPageContentProps {
  pkg: {
    name: string;
    price: number;
    destinations: string[];
    stayInfo: string;
    foodInfo: string;
    travelInfo: string;
    travelPeriod: string | null;
    routeOverview: string | null;
    importantInfo: string | null;
    active: boolean;
    images: { url: string }[];
    itineraryMedia: { url: string } | null;
  };
}

export function ChardhamPageContent({ pkg }: ChardhamPageContentProps) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{pkg.name}</h1>
      <p className="mt-2 text-2xl font-medium text-amber-700">
        {formatInr(pkg.price)} <span className="text-base text-zinc-500">/ person</span>
      </p>

      {pkg.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pkg.images.map((image) => (
            <div key={image.url} className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={image.url}
                alt={pkg.name}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Destinations</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {pkg.destinations.map((destination) => (
            <li
              key={destination}
              className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
            >
              {destination}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-500">Stay</h3>
          <p>{pkg.stayInfo}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-500">Food</h3>
          <p>{pkg.foodInfo}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-500">Travel</h3>
          <p>{pkg.travelInfo}</p>
        </div>
      </section>

      {pkg.travelPeriod && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Available travel period</h2>
          <p className="mt-1">{pkg.travelPeriod}</p>
        </section>
      )}

      {pkg.routeOverview && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Route overview</h2>
          <p className="mt-1">{pkg.routeOverview}</p>
        </section>
      )}

      {pkg.importantInfo && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Important information</h2>
          <p className="mt-1">{pkg.importantInfo}</p>
        </section>
      )}

      {pkg.itineraryMedia && (
        <p className="mt-8">
          <a
            href={pkg.itineraryMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline"
          >
            View itinerary (PDF)
          </a>
        </p>
      )}

      <section className="mt-10 rounded-lg border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold">Check availability</h2>
        {pkg.active ? (
          <div className="mt-4">
            <ChardhamAvailabilityForm />
          </div>
        ) : (
          <p className="mt-2 text-zinc-600">
            This package is currently unavailable for booking. Please check back soon
            or contact us for more details.
          </p>
        )}
      </section>
    </article>
  );
}
