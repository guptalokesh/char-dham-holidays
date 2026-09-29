import type { Metadata } from "next";
import { getWebsiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the Char Dham Holidays website and booking process.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const settings = await getWebsiteSettings();
  const contactEmail = settings.enquiryEmail ?? settings.primaryEmail;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Terms</h1>

      <section className="mt-8 space-y-4 text-stone-700">
        <h2 className="text-lg font-semibold">How booking works</h2>
        <p>
          This website lets you discover our Chardham Yatra by Helicopter,
          trekking and Farm Home Stay offerings, check availability, and send
          a request. Submitting a form on this site (an availability check,
          booking request or general enquiry) does not confirm a booking. Our
          team personally confirms availability, itinerary details and
          payment instructions with you directly, usually over WhatsApp.
        </p>

        <h2 className="text-lg font-semibold">Payments</h2>
        <p>
          This website does not process online payments. Payment instructions
          and collection are handled directly by our team once your booking
          details are confirmed.
        </p>

        <h2 className="text-lg font-semibold">Pricing and availability</h2>
        <p>
          Prices, packages and availability shown on this site are managed by
          us and may change. Displayed availability is indicative and is
          always subject to final confirmation by our team.
        </p>

        <h2 className="text-lg font-semibold">Acceptable use</h2>
        <p>
          Please use this website and its forms only to make genuine enquiries
          or booking requests. We may decline to process submissions that
          appear abusive, fraudulent or automated.
        </p>

        {contactEmail && (
          <>
            <h2 className="text-lg font-semibold">Contact us</h2>
            <p>If you have questions about these terms, please contact us at {contactEmail}.</p>
          </>
        )}
      </section>
    </main>
  );
}
