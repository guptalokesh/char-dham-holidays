import type { Metadata } from "next";
import { getWebsiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description: "About Char Dham Holidays — Chardham Yatra, trekking and Farm Home Stay in Uttarakhand.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const settings = await getWebsiteSettings();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
        About us
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
        About {settings.businessName}
      </h1>

      {settings.shortDescription && (
        <p className="mt-5 text-lg text-stone-700">{settings.shortDescription}</p>
      )}

      <section className="mt-8 space-y-4 text-stone-700">
        <p>
          {settings.businessName} helps travellers discover Uttarakhand through three
          experiences: the Chardham Yatra by Helicopter, customised Himalayan
          treks, and a peaceful Farm Home Stay.
        </p>
        <p>
          We help you discover our services, check availability and get in touch.
          Our team personally confirms availability, itinerary details and
          payment instructions directly with you over WhatsApp before any
          booking is finalised.
        </p>
      </section>

      {(settings.addressLine || settings.city || settings.primaryEmail || settings.primaryPhone) && (
        <section className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">Reach us</h2>
          <div className="mt-3 space-y-1.5 break-words text-sm text-stone-600">
            {settings.addressLine && (
              <p>
                {settings.addressLine}
                {settings.city ? `, ${settings.city}` : ""}
                {settings.state ? `, ${settings.state}` : ""}
              </p>
            )}
            {settings.primaryPhone && <p>Phone: {settings.primaryPhone}</p>}
            {settings.primaryEmail && <p>Email: {settings.primaryEmail}</p>}
          </div>
        </section>
      )}
    </main>
  );
}
