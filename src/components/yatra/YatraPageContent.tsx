import Image from "next/image";
import { formatPriceOrRequest } from "@/lib/format";
import { ChardhamAvailabilityForm } from "@/components/chardham/ChardhamAvailabilityForm";

export interface YatraStepView {
  title: string;
  description: string;
  featured: boolean;
  imageUrl?: string;
}

export interface YatraView {
  slug: string;
  name: string;
  tagline: string | null;
  price: number | null;
  dhamChoice: boolean;
  active: boolean;
  routeOverview: string | null;
  startPoint: string | null;
  howItStarts: string | null;
  steps: YatraStepView[];
  inclusions: string[];
  importantInfo: string | null;
  stayInfo: string;
  foodInfo: string;
  travelInfo: string;
  images: { url: string }[];
  itineraryMedia: { url: string } | null;
}

const FACTS = [
  { key: "stayInfo", label: "Stay", icon: "🏠" },
  { key: "foodInfo", label: "Food", icon: "🍽️" },
  { key: "travelInfo", label: "Travel", icon: "🚁" },
] as const;

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight text-stone-900">
      {children}
    </h2>
  );
}

export function YatraPageContent({
  pkg,
  dhamOptions,
}: {
  pkg: YatraView;
  dhamOptions: YatraStepView[];
}) {
  const heroImage = pkg.images[0];
  const facts = FACTS.filter(({ key }) => pkg[key].trim() !== "");
  const goodToKnow = (pkg.importantInfo ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article>
      <div className="relative min-h-[420px] w-full overflow-hidden bg-gradient-to-br from-blue-950 via-stone-900 to-amber-900">
        {heroImage && (
          <Image
            src={heroImage.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/10" />
        <div className="relative mx-auto flex min-h-[420px] max-w-4xl flex-col justify-end px-6 pb-12 pt-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Helicopter Yatra
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {pkg.name}
          </h1>
          {pkg.tagline && <p className="mt-3 max-w-2xl text-lg text-stone-200">{pkg.tagline}</p>}
          <p className="mt-5 text-2xl font-medium text-amber-300">
            {formatPriceOrRequest(pkg.price)}
            {pkg.price !== null && <span className="text-base text-stone-200"> per person</span>}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-14 px-6 py-14">
        {pkg.routeOverview && <p className="max-w-3xl text-lg text-stone-700">{pkg.routeOverview}</p>}

        {(pkg.startPoint || pkg.howItStarts) && (
          <section aria-labelledby="yatra-start" className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8">
            <SectionHeading id="yatra-start">Where and how it starts</SectionHeading>
            {pkg.startPoint && (
              <p className="mt-3 text-lg font-medium text-amber-900">{pkg.startPoint}</p>
            )}
            {pkg.howItStarts && <p className="mt-2 text-stone-700">{pkg.howItStarts}</p>}
          </section>
        )}

        {pkg.steps.length > 0 && (
          <section aria-labelledby="yatra-journey">
            <SectionHeading id="yatra-journey">Your journey, in order</SectionHeading>
            <ol className="mt-8 space-y-6 border-l-2 border-amber-300 pl-6">
              {pkg.steps.map((step, index) => (
                <li key={`${step.title}-${index}`} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.15rem] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white"
                  >
                    {index + 1}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-stone-900">{step.title}</h3>
                    {step.featured && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-800">
                        Dham
                      </span>
                    )}
                  </div>
                  {step.description && <p className="mt-1 text-stone-700">{step.description}</p>}
                  {step.imageUrl && (
                    <div className="relative mt-3 aspect-[16/9] max-w-xl overflow-hidden rounded-xl">
                      <Image
                        src={step.imageUrl}
                        alt={step.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 576px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {pkg.dhamChoice && dhamOptions.length > 0 && (
          <section aria-labelledby="yatra-dhams">
            <SectionHeading id="yatra-dhams">Which dham(s)?</SectionHeading>
            <p className="mt-2 text-stone-700">
              Choose any one or more of these dhams in the request form below. Here is what each visit involves.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dhamOptions.map((dham) => (
                <div key={dham.title} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-900">{dham.title}</h3>
                  <p className="mt-1 text-sm text-stone-700">{dham.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(pkg.inclusions.length > 0 || facts.length > 0) && (
          <section aria-labelledby="yatra-included">
            <SectionHeading id="yatra-included">What&apos;s usually included</SectionHeading>
            {facts.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {facts.map(({ key, label, icon }) => (
                  <div key={key} className="rounded-xl border border-stone-200 bg-white p-5">
                    <span className="text-2xl" aria-hidden="true">
                      {icon}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-stone-500">{label}</h3>
                    <p className="mt-1 text-stone-800">{pkg[key]}</p>
                  </div>
                ))}
              </div>
            )}
            {pkg.inclusions.length > 0 && (
              <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {pkg.inclusions.map((item) => (
                  <li key={item} className="flex gap-2 text-stone-800">
                    <span aria-hidden="true" className="text-green-700">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {goodToKnow.length > 0 && (
          <section aria-labelledby="yatra-good-to-know" className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
            <SectionHeading id="yatra-good-to-know">Good to know</SectionHeading>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-700">
              {goodToKnow.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {pkg.itineraryMedia && (
          <p>
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

        <section
          aria-labelledby="yatra-request"
          className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-8"
        >
          <SectionHeading id="yatra-request">Check availability</SectionHeading>
          {pkg.active ? (
            <div className="mt-4">
              <ChardhamAvailabilityForm packageSlug={pkg.slug} dhamChoice={pkg.dhamChoice} />
            </div>
          ) : (
            <p className="mt-2 text-stone-600">
              This yatra is not taking requests at the moment. Please contact us for details.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
