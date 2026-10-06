import { OfferCard } from "@/components/layout/OfferCard";
import Image from "next/image";
import Link from "next/link";
import { formatInr, formatPriceOrRequest } from "@/lib/format";
import { WhatsAppCta } from "@/components/layout/WhatsAppCta";
import { PhotoCredits } from "@/components/yatra/PhotoCredits";

export interface HomeYatra {
  slug: string;
  name: string;
  tagline: string | null;
  price: number | null;
  images: { url: string }[];
}

export interface HomeDham {
  title: string;
  description: string;
  imageUrl?: string | null;
}

export interface HomePageContentProps {
  heroHeading: string;
  heroDescription: string;
  chardhamCtaLabel: string;
  trekkingCtaLabel: string;
  chardhamPrice: number | null;
  whatsappNumber: string | null;
  whatsappCtaText: string;
  contactCtaText: string;
  yatras?: HomeYatra[];
  dhams?: HomeDham[];
  journey?: string[];
  inclusions?: string[];
  trekImageUrl?: string | null;
  farmImageUrl?: string | null;
  devrana?: { title: string; summary: string; imageUrl?: string | null } | null;
}

function OfferingCard({
  href,
  imageUrl,
  imageAlt,
  eyebrow,
  eyebrowClassName,
  title,
  titleClassName,
  description,
  priceLabel,
  priceClassName,
}: {
  href: string;
  imageUrl?: string | null;
  imageAlt: string;
  eyebrow: string;
  eyebrowClassName: string;
  title: string;
  titleClassName: string;
  description: string;
  priceLabel: string;
  priceClassName: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${eyebrowClassName}`}
        >
          {eyebrow}
        </span>
      </div>
      <div className="p-6">
        <h3 className={`text-xl font-semibold ${titleClassName}`}>{title}</h3>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
        <p className={`mt-4 font-medium ${priceClassName}`}>{priceLabel}</p>
      </div>
    </Link>
  );
}

export function HomePageContent({
  heroHeading,
  heroDescription,
  chardhamCtaLabel,
  trekkingCtaLabel,
  chardhamPrice,
  whatsappNumber,
  whatsappCtaText,
  contactCtaText,
  yatras = [],
  dhams = [],
  journey = [],
  inclusions = [],
  trekImageUrl,
  farmImageUrl,
  devrana,
}: HomePageContentProps) {
  return (
    <main>
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-stone-900">
        <Image
          src="/hero-himalaya.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Yamunotri · Gangotri · Kedarnath · Badrinath
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-6xl">
            {heroHeading}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-200">
            {heroDescription}
          </p>
          {chardhamPrice !== null && (
            <p className="mt-4 text-xl font-medium text-amber-300">
              From {formatInr(chardhamPrice)} per person
            </p>
          )}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/yatra/char-dham"
              className="rounded-full bg-amber-500 px-7 py-3.5 font-semibold text-stone-900 shadow-lg shadow-amber-900/30 transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl"
            >
              {chardhamCtaLabel}
            </Link>
            <Link
              href="/yatra"
              className="rounded-full border-2 border-white/70 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-stone-900"
            >
              See all yatras
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-offer"
        className="mx-auto -mt-10 max-w-2xl px-6 sm:-mt-14"
      >
        <div className="relative rounded-2xl border border-amber-200 bg-[#fdfbf7] p-6 shadow-xl">
          <OfferCard
            charDhamPrice={yatras.find((y) => y.slug === "char-dham")?.price ?? null}
            anyDhamPrice={yatras.find((y) => y.slug === "any-dham")?.price ?? null}
            titleId="home-offer"
          />
        </div>
      </section>

      {dhams.length > 0 && (
        <section
          aria-labelledby="home-dhams"
          className="mx-auto max-w-6xl px-6 py-20"
        >
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Sacred shrines
            </p>
            <h2
              id="home-dhams"
              className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl"
            >
              The Four Dhams
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dhams.map((dham) => (
              <div
                key={dham.title}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-900 via-stone-800 to-amber-700">
                  {dham.imageUrl && (
                    <Image
                      src={dham.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-blue-900">
                    {dham.title}
                  </h3>
                  <p className="mt-2 line-clamp-4 text-sm text-stone-600">
                    {dham.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <PhotoCredits urls={dhams.map((d) => d.imageUrl)} />
          </div>
        </section>
      )}

      {yatras.length > 0 && (
        <section
          aria-labelledby="home-yatras"
          className="bg-stone-100 px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Helicopter Yatra
              </p>
              <h2
                id="home-yatras"
                className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl"
              >
                Our Helicopter Yatras
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {yatras.map((yatra) => (
                <Link
                  key={yatra.slug}
                  href={`/yatra/${yatra.slug}`}
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-900 to-amber-700">
                    {yatra.images[0] && (
                      <Image
                        src={yatra.images[0].url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-stone-900">
                      {yatra.name}
                    </h3>
                    {yatra.tagline && (
                      <p className="mt-2 text-sm text-stone-600">
                        {yatra.tagline}
                      </p>
                    )}
                    <p className="mt-4 font-medium text-amber-800">
                      {formatPriceOrRequest(yatra.price)}
                      {yatra.price !== null && (
                        <span className="text-sm text-stone-500">
                          {" "}
                          per person
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {journey.length > 0 && (
        <section
          aria-labelledby="home-how"
          className="mx-auto max-w-4xl px-6 py-20"
        >
          <div className="text-center">
            <h2
              id="home-how"
              className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl"
            >
              How Your Yatra Works
            </h2>
            <p className="mt-3 text-stone-600">
              A simple sequence from your arrival to your return.
            </p>
          </div>
          <ol className="mt-10 space-y-4">
            {journey.map((title, index) => (
              <li
                key={`${title}-${index}`}
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-500 font-semibold text-white"
                >
                  {index + 1}
                </span>
                <span className="text-lg text-stone-800">{title}</span>
              </li>
            ))}
          </ol>
          {inclusions.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-stone-900">
                What&apos;s usually included
              </h3>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {inclusions.map((item) => (
                  <li key={item} className="flex gap-2 text-stone-700">
                    <span aria-hidden="true" className="text-green-700">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section
        aria-labelledby="home-other"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            More to explore
          </p>
          <h2
            id="home-other"
            className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl"
          >
            Other Experiences
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <OfferingCard
            href="/trekking"
            imageUrl={trekImageUrl}
            imageAlt="Trekking in Uttarakhand"
            eyebrow="Adventure"
            eyebrowClassName="bg-emerald-600 text-white"
            title="Trekking"
            titleClassName="text-emerald-900"
            description="Customised treks built around your group."
            priceLabel="Customised service"
            priceClassName="text-emerald-800"
          />
          <OfferingCard
            href="/farm-home-stay"
            imageUrl={farmImageUrl}
            imageAlt="Farm Home Stay"
            eyebrow="Peaceful"
            eyebrowClassName="bg-green-700 text-white"
            title="Farm Home Stay"
            titleClassName="text-green-900"
            description="Nature-focused accommodation in Uttarakhand."
            priceLabel="Check availability"
            priceClassName="text-green-800"
          />
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/trekking"
            className="font-medium text-emerald-800 underline underline-offset-2"
          >
            {trekkingCtaLabel}
          </Link>
        </p>
      </section>

      {devrana && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <Link
            href="/trekking#devrana-mandir"
            className="group relative block h-72 overflow-hidden rounded-2xl bg-amber-950 shadow-sm sm:h-80"
          >
            {devrana.imageUrl && (
              <Image
                src={devrana.imageUrl}
                alt={devrana.title}
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                Discover
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {devrana.title}
              </h2>
              <p className="mt-2 max-w-xl text-stone-200">{devrana.summary}</p>
            </div>
          </Link>
        </section>
      )}

      <section className="bg-gradient-to-br from-stone-900 to-stone-800 px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to plan your Uttarakhand journey?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-stone-300">
          Reach out and our team will help you plan the trip, confirm
          availability and share every detail directly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <WhatsAppCta
            phone={whatsappNumber}
            message="Hello, I would like to plan my Uttarakhand journey."
            label={whatsappCtaText}
            className="inline-block rounded-full bg-green-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-green-900/40 transition-all hover:-translate-y-0.5 hover:bg-green-500"
          />
          <Link
            href="/contact"
            className="inline-block rounded-full border-2 border-white/70 px-7 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-stone-900"
          >
            {contactCtaText}
          </Link>
        </div>
      </section>
    </main>
  );
}
