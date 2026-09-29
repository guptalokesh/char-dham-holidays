import Link from "next/link";
import { formatInr } from "@/lib/format";
import { WhatsAppCta } from "@/components/layout/WhatsAppCta";

export interface HomePageContentProps {
  heroHeading: string;
  heroDescription: string;
  chardhamCtaLabel: string;
  trekkingCtaLabel: string;
  chardhamPrice: number;
  whatsappNumber: string | null;
  whatsappCtaText: string;
  contactCtaText: string;
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
}: HomePageContentProps) {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {heroHeading}
        </h1>
        <p className="mt-4 text-lg text-zinc-600">{heroDescription}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/chardham"
            className="rounded bg-amber-700 px-6 py-3 font-medium text-white hover:bg-amber-800"
          >
            {chardhamCtaLabel}
          </Link>
          <Link
            href="/trekking"
            className="rounded bg-emerald-800 px-6 py-3 font-medium text-white hover:bg-emerald-900"
          >
            {trekkingCtaLabel}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-center text-2xl font-semibold">
          Three Ways to Experience Uttarakhand
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Link
            href="/chardham"
            className="rounded-lg border border-zinc-200 p-6 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold">Chardham Yatra by Helicopter</h3>
            <p className="mt-2 text-sm text-zinc-600">Stay, food and travel included.</p>
            <p className="mt-3 font-medium text-amber-800">
              {formatInr(chardhamPrice)} <span className="text-sm text-zinc-500">/ person</span>
            </p>
          </Link>
          <Link
            href="/trekking"
            className="rounded-lg border border-emerald-100 p-6 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-emerald-900">Trekking</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Customised treks built around your group.
            </p>
            <p className="mt-3 font-medium text-emerald-800">Customised service</p>
          </Link>
          <Link
            href="/farm-home-stay"
            className="rounded-lg border border-green-100 p-6 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-green-900">Farm Home Stay</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Nature-focused accommodation in Uttarakhand.
            </p>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold">Ready to plan your Uttarakhand journey?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <WhatsAppCta
            phone={whatsappNumber}
            message="Hello, I would like to plan my Uttarakhand journey."
            label={whatsappCtaText}
          />
          <Link
            href="/contact"
            className="inline-block rounded border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
          >
            {contactCtaText}
          </Link>
        </div>
      </section>
    </main>
  );
}
