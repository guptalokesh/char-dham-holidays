import Image from "next/image";
import { formatInr } from "@/lib/format";
import { TrekRequestForm } from "@/components/trek/TrekRequestForm";

export interface TrekPageContentProps {
  trek: {
    slug: string;
    name: string;
    description: string;
    price: number | null;
    active: boolean;
    images: { url: string }[];
    itineraryMedia: { url: string } | null;
  };
}

export function TrekPageContent({ trek }: TrekPageContentProps) {
  return (
    <article>
      <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden bg-emerald-950">
        {trek.images[0] && (
          <Image
            src={trek.images[0].url}
            alt={trek.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-emerald-950/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-6 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Trekking
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {trek.name}
          </h1>
          <p className="mt-3 text-xl font-medium text-emerald-300">
            {trek.price ? formatInr(trek.price) : "Customised service"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-stone-700">{trek.description}</p>

        {trek.itineraryMedia && (
          <p className="mt-6">
            <a
              href={trek.itineraryMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
            >
              View itinerary (PDF)
            </a>
          </p>
        )}

        <section className="mt-10 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Request availability</h2>
          {trek.active ? (
            <div className="mt-4">
              <TrekRequestForm trekSlug={trek.slug} />
            </div>
          ) : (
            <p className="mt-2 text-stone-600">
              This trek is currently unavailable. Please check back soon or contact us
              for more details.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
