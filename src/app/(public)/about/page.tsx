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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">About {settings.businessName}</h1>

      {settings.shortDescription && (
        <p className="mt-4 text-zinc-700">{settings.shortDescription}</p>
      )}

      <section className="mt-8 space-y-4 text-zinc-700">
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
        <section className="mt-10 rounded-lg border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold">Reach us</h2>
          <div className="mt-2 space-y-1 text-sm text-zinc-600">
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
