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
    aircraftHandlingInfo?: string | null;
    active: boolean;
    images: { url: string }[];
    itineraryMedia: { url: string } | null;
  };
}

const INCLUSIONS = [
  { key: "stayInfo", label: "Stay", icon: "🏠" },
  { key: "foodInfo", label: "Food", icon: "🍽️" },
  { key: "travelInfo", label: "Travel", icon: "🚁" },
] as const;

export function ChardhamPageContent({ pkg }: ChardhamPageContentProps) {
  const heroImage = pkg.images[0];
  const galleryImages = pkg.images.slice(1);

  return (
    <article>
      <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden bg-stone-900">
        {heroImage && (
          <Image
            src={heroImage.url}
            alt={pkg.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-stone-950/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-6 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Chardham Yatra
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {pkg.name}
          </h1>
          <p className="mt-3 text-2xl font-medium text-amber-300">
            {formatInr(pkg.price)} <span className="text-base text-stone-200">/ person</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryImages.map((image) => (
              <div key={image.url} className="relative aspect-video overflow-hidden rounded-xl">
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

        <section className={galleryImages.length > 0 ? "mt-10" : ""}>
          <h2 className="text-lg font-semibold text-stone-900">Destinations</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {pkg.destinations.map((destination) => (
              <li
                key={destination}
                className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-800"
              >
                {destination}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {INCLUSIONS.map(({ key, label, icon }) => (
            <div key={key} className="rounded-xl border border-stone-200 bg-white p-5">
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                {label}
              </h3>
              <p className="mt-1 text-stone-800">{pkg[key]}</p>
            </div>
          ))}
        </section>

        {pkg.travelPeriod && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-stone-900">Available travel period</h2>
            <p className="mt-1 text-stone-700">{pkg.travelPeriod}</p>
          </section>
        )}

        {pkg.routeOverview && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-stone-900">Route overview</h2>
            <p className="mt-1 text-stone-700">{pkg.routeOverview}</p>
          </section>
        )}

        {pkg.aircraftHandlingInfo && (
          <section className="mt-10 rounded-xl border border-blue-100 bg-blue-50/60 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Yamunotri &amp; Gangotri helicopter handling
            </h2>
            <p className="mt-2 text-stone-700">{pkg.aircraftHandlingInfo}</p>
          </section>
        )}

        {pkg.importantInfo && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-stone-900">Important information</h2>
            <p className="mt-1 text-stone-700">{pkg.importantInfo}</p>
          </section>
        )}

        {pkg.itineraryMedia && (
          <p className="mt-10">
            <a
              href={pkg.itineraryMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
            >
              View itinerary (PDF)
            </a>
          </p>
        )}

        <section className="mt-12 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Check availability</h2>
          {pkg.active ? (
            <div className="mt-4">
              <ChardhamAvailabilityForm />
            </div>
          ) : (
            <p className="mt-2 text-stone-600">
              This package is currently unavailable for booking. Please check back soon
              or contact us for more details.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
