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
    <article className="mx-auto max-w-3xl px-6 py-12">
      {trek.images[0] && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={trek.images[0].url}
            alt={trek.name}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-emerald-900">
        {trek.name}
      </h1>
      <p className="mt-2 text-lg font-medium text-emerald-800">
        {trek.price ? formatInr(trek.price) : "Customised service"}
      </p>
      <p className="mt-4 text-zinc-700">{trek.description}</p>

      {trek.itineraryMedia && (
        <p className="mt-6">
          <a
            href={trek.itineraryMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-800 underline"
          >
            View itinerary (PDF)
          </a>
        </p>
      )}

      <section className="mt-10 rounded-lg border border-emerald-100 p-6">
        <h2 className="text-lg font-semibold">Request availability</h2>
        {trek.active ? (
          <div className="mt-4">
            <TrekRequestForm trekSlug={trek.slug} />
          </div>
        ) : (
          <p className="mt-2 text-zinc-600">
            This trek is currently unavailable. Please check back soon or contact us
            for more details.
          </p>
        )}
      </section>
    </article>
  );
}
